using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Text.RegularExpressions;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegexController : ControllerBase
{
    [HttpPost("test")]
    public DataReply<RegexTestResult> Test([FromBody] RegexTestRequest request)
    {
        try
        {
            var flags = RegexOptions.None;
            if (request.IgnoreCase) flags |= RegexOptions.IgnoreCase;
            if (request.Multiline) flags |= RegexOptions.Multiline;

            var regex = new Regex(request.Pattern, flags);
            var matches = regex.Matches(request.Text);
            var matchResults = matches.Cast<Match>().Select(m => new RegexMatch
            {
                Value = m.Value,
                Index = m.Index,
                Length = m.Length,
                Groups = [.. m.Groups.Cast<Group>().Skip(1).Select(g => new RegexGroup
                {
                    Name = g.Name,
                    Value = g.Value,
                    Index = g.Index,
                    Length = g.Length,
                    Success = g.Success
                })]
            }).ToList();

            return DataReply.Succeed(new RegexTestResult { IsValid = true, Matches = matchResults });
        }
        catch (ArgumentException ex)
        {
            return DataReply.Succeed(new RegexTestResult { IsValid = false, Matches = [], Error = ex.Message });
        }
    }

    [HttpGet("patterns")]
    public DataReply<List<RegexPattern>> GetPatterns()
    {
        var patterns = new List<RegexPattern>
        {
            new("电子邮件", @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", "匹配标准电子邮件地址"),
            new("URL", @"^https?://[\w\-]+(\.[\w\-]+)+[/#?]?.*$", "匹配HTTP/HTTPS URL"),
            new("IP地址(IPv4)", @"^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$", "匹配IPv4地址"),
            new("手机号(中国大陆)", @"^1[3-9]\d{9}$", "匹配中国大陆手机号"),
            new("身份证号(18位)", @"^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$", "匹配18位身份证号"),
            new("中文字符", @"[一-龥]+", "匹配中文字符"),
            new("日期(yyyy-MM-dd)", @"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$", "匹配yyyy-MM-dd格式日期"),
            new("整数", @"^-?\d+$", "匹配正整数、负整数和零"),
            new("浮点数", @"^-?\d+\.\d+$", "匹配浮点数"),
            new("十六进制颜色", @"^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$", "匹配十六进制颜色值"),
        };
        return DataReply.Succeed(patterns);
    }
}

public class RegexTestRequest
{
    public string Pattern { get; set; } = "";
    public string Text { get; set; } = "";
    public bool IgnoreCase { get; set; }
    public bool Multiline { get; set; }
}

public class RegexTestResult
{
    public bool IsValid { get; set; }
    public List<RegexMatch> Matches { get; set; } = [];
    public string? Error { get; set; }
}

public class RegexMatch
{
    public string Value { get; set; } = "";
    public int Index { get; set; }
    public int Length { get; set; }
    public List<RegexGroup> Groups { get; set; } = [];
}

public class RegexGroup
{
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
    public int Index { get; set; }
    public int Length { get; set; }
    public bool Success { get; set; }
}

public class RegexPattern(string name, string pattern, string description)
{
    public string Name { get; set; } = name;
    public string Pattern { get; set; } = pattern;
    public string Description { get; set; } = description;
}
