using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Text;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StringController : ControllerBase
{
    [HttpPost("escape")]
    public DataReply<string> Escape([FromBody] StringRequest request)
    {
        return DataReply.Succeed(request.Text.Escape());
    }

    [HttpPost("unescape")]
    public DataReply<string> Unescape([FromBody] StringRequest request)
    {
        return DataReply.Succeed(request.Text.RemoveEscape());
    }

    [HttpPost("case")]
    public DataReply<string> CaseConvert([FromBody] CaseRequest request)
    {
        var result = request.TargetCase.ToLower() switch
        {
            "upper" => request.Text.ToUpper(),
            "lower" => request.Text.ToLower(),
            "camelcase" => ToCamelCase(request.Text),
            "pascalcase" => ToPascalCase(request.Text),
            "snake_case" => ToSnakeCase(request.Text),
            "kebab-case" => ToKebabCase(request.Text),
            _ => throw new NotSupportedException($"不支持的格式: {request.TargetCase}")
        };
        return DataReply.Succeed(result);
    }

    [HttpPost("random")]
    public DataReply<string> Random([FromBody] RandomStringRequest request)
    {
        var type = request.CharSet.ToLower() switch
        {
            "number" => RandomType.Number,
            "letter_lower" => RandomType.LetterLower,
            "letter_upper" => RandomType.LetterUpper,
            "letter" => RandomType.Letter,
            "number_and_letter" => RandomType.NumberAndLetter,
            "mix" => RandomType.Mix,
            _ => RandomType.NumberAndLetter
        };
        return DataReply.Succeed(type.GenerateCode((byte)request.Length));
    }

    static string ToCamelCase(string s)
    {
        var words = SplitWords(s);
        if (words.Length == 0) return s;
        var sb = new StringBuilder();
        sb.Append(words[0].ToLower());
        for (var i = 1; i < words.Length; i++)
            sb.Append(char.ToUpper(words[i][0]) + words[i][1..].ToLower());
        return sb.ToString();
    }

    static string ToPascalCase(string s)
    {
        var words = SplitWords(s);
        if (words.Length == 0) return s;
        var sb = new StringBuilder();
        foreach (var word in words)
            sb.Append(char.ToUpper(word[0]) + word[1..].ToLower());
        return sb.ToString();
    }

    static string ToSnakeCase(string s) => string.Join("_", SplitWords(s).Select(w => w.ToLower()));
    static string ToKebabCase(string s) => string.Join("-", SplitWords(s).Select(w => w.ToLower()));

    static string[] SplitWords(string s)
    {
        var words = new List<string>();
        var current = new StringBuilder();
        foreach (var c in s)
        {
            if (char.IsUpper(c) && current.Length > 0)
            {
                words.Add(current.ToString());
                current.Clear();
            }
            if (c is '_' or '-' or ' ')
            {
                if (current.Length > 0) { words.Add(current.ToString()); current.Clear(); }
                continue;
            }
            current.Append(c);
        }
        if (current.Length > 0) words.Add(current.ToString());
        return [.. words];
    }
}

public class StringRequest { public string Text { get; set; } = ""; }
public class CaseRequest { public string Text { get; set; } = ""; public string TargetCase { get; set; } = ""; }
public class RandomStringRequest { public int Length { get; set; } = 16; public string CharSet { get; set; } = "number_and_letter"; }
