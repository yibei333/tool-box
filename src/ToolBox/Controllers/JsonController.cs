using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Text.Json;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JsonController : ControllerBase
{
    [HttpPost("format")]
    public DataReply<string> Format([FromBody] JsonTextRequest request)
    {
        var result = request.Json.FormatJson();
        return DataReply.Succeed(result);
    }

    [HttpPost("compress")]
    public DataReply<string> Compress([FromBody] JsonTextRequest request)
    {
        var result = request.Json.CompressJson();
        return DataReply.Succeed(result);
    }

    [HttpPost("to-csharp")]
    public DataReply<string> ToCSharp([FromBody] JsonToCSharpRequest request)
    {
        var rootName = string.IsNullOrWhiteSpace(request.RootName) ? "Root" : request.RootName;
        var code = JsonToCSharpConverter.Convert(request.Json, rootName);
        return DataReply.Succeed(code);
    }

    [HttpPost("from-csharp")]
    public DataReply<string> FromCSharp([FromBody] CSharpToJsonRequest request)
    {
        var json = CSharpToJsonConverter.Convert(request.Code);
        return DataReply.Succeed(json);
    }

    [HttpPost("escape")]
    public DataReply<string> Escape([FromBody] JsonTextRequest request)
    {
        return DataReply.Succeed(request.Json.Escape());
    }

    [HttpPost("unescape")]
    public DataReply<string> Unescape([FromBody] JsonTextRequest request)
    {
        return DataReply.Succeed(request.Json.RemoveEscape());
    }
}

public class JsonTextRequest
{
    public string Json { get; set; } = "";
}

public class JsonToCSharpRequest
{
    public string Json { get; set; } = "";
    public string? RootName { get; set; }
}

public class CSharpToJsonRequest
{
    public string Code { get; set; } = "";
}

static class JsonToCSharpConverter
{
    public static string Convert(string json, string rootName)
    {
        using var doc = JsonDocument.Parse(json);
        var classes = new List<string>();
        GenerateClass(doc.RootElement, rootName, classes);
        return string.Join("\n\n", classes);
    }

    static void GenerateClass(JsonElement element, string className, List<string> classes)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"public class {className}");
        sb.AppendLine("{");

        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in element.EnumerateObject())
            {
                var csharpType = MapType(prop.Value, prop.Name, classes);
                sb.AppendLine($"    public {csharpType} {Capitalize(prop.Name)} {{ get; set; }}");
            }
        }

        sb.AppendLine("}");
        classes.Add(sb.ToString());
    }

    static string MapType(JsonElement value, string propName, List<string> classes)
    {
        return value.ValueKind switch
        {
            JsonValueKind.String => "string",
            JsonValueKind.Number => value.TryGetInt64(out _) ? "long" : "double",
            JsonValueKind.True or JsonValueKind.False => "bool",
            JsonValueKind.Null => "object",
            JsonValueKind.Array => MapArrayType(value, propName, classes),
            JsonValueKind.Object => GenerateNestedClass(value, propName, classes),
            _ => "object"
        };
    }

    static string MapArrayType(JsonElement array, string propName, List<string> classes)
    {
        if (array.GetArrayLength() == 0) return "List<object>";
        var first = array.EnumerateArray().First();
        var itemType = first.ValueKind switch
        {
            JsonValueKind.String => "string",
            JsonValueKind.Number => first.TryGetInt64(out _) ? "long" : "double",
            JsonValueKind.True or JsonValueKind.False => "bool",
            JsonValueKind.Object => GenerateNestedClass(first, propName, classes),
            _ => "object"
        };
        return $"List<{itemType}>";
    }

    static string GenerateNestedClass(JsonElement obj, string propName, List<string> classes)
    {
        var className = Capitalize(propName);
        GenerateClass(obj, className, classes);
        return className;
    }

    static string Capitalize(string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        return char.ToUpper(s[0]) + s[1..];
    }
}

static class CSharpToJsonConverter
{
    public static string Convert(string code)
    {
        var lines = code.Split('\n').Select(l => l.Trim()).Where(l => l.StartsWith("public ") && l.Contains("{ get; set; }"));
        var properties = new List<(string Name, string Type)>();

        foreach (var line in lines)
        {
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 3)
            {
                var type = parts[1];
                var name = parts[2].Split('{')[0].Trim();
                properties.Add((name, type));
            }
        }

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("{");
        for (var i = 0; i < properties.Count; i++)
        {
            var (name, type) = properties[i];
            var jsonName = char.ToLower(name[0]) + name[1..];
            var sampleValue = type switch
            {
                "string" => "\"example\"",
                "int" or "long" => "0",
                "double" or "float" or "decimal" => "0.0",
                "bool" => "true",
                _ when type.StartsWith("List<") => "[]",
                _ => "{}"
            };
            var comma = i < properties.Count - 1 ? "," : "";
            sb.AppendLine($"  \"{jsonName}\": {sampleValue}{comma}");
        }
        sb.AppendLine("}");
        return sb.ToString();
    }
}
