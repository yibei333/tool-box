using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Text;
using System.Text.Json;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JwtController : ControllerBase
{
    [HttpPost("generate-hmac")]
    public DataReply<string> GenerateHmac([FromBody] JwtHmacRequest request)
    {
        var payload = JsonSerializer.Deserialize<Dictionary<string, object>>(request.Payload)
            ?? throw new ArgumentException("无效的Payload JSON");
        var secret = Encoding.UTF8.GetBytes(request.Secret);
        var token = JwtHelper.CreateWithHmacSha256(payload, secret);
        return DataReply.Succeed(token);
    }

    [HttpPost("generate-rsa")]
    public DataReply<string> GenerateRsa([FromBody] JwtRsaRequest request)
    {
        var payload = JsonSerializer.Deserialize<Dictionary<string, object>>(request.Payload)
            ?? throw new ArgumentException("无效的Payload JSON");
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        var token = JwtHelper.CreateWithRsaSha256(payload, request.PrivateKey, password);
        return DataReply.Succeed(token);
    }

    [HttpPost("verify-hmac")]
    public DataReply<JwtVerifyResultDto> VerifyHmac([FromBody] JwtVerifyHmacRequest request)
    {
        var secret = Encoding.UTF8.GetBytes(request.Secret);
        var result = JwtHelper.VerifyWithHmacSha256(request.Token, secret);
        return DataReply.Succeed(new JwtVerifyResultDto
        {
            IsVerified = result.IsVerified,
            Header = result.Header,
            Payload = result.Payload,
            Algorithm = result.Header?.Let(h => { try { return JsonSerializer.Deserialize<JsonElement>(h).GetProperty("alg").GetString() ?? string.Empty; } catch { return string.Empty; } })
        });
    }

    [HttpPost("verify-rsa")]
    public DataReply<JwtVerifyResultDto> VerifyRsa([FromBody] JwtVerifyRsaRequest request)
    {
        var result = JwtHelper.VerifyWithRsaSha256(request.Token, request.PublicKey);
        return DataReply.Succeed(new JwtVerifyResultDto
        {
            IsVerified = result.IsVerified,
            Header = result.Header,
            Payload = result.Payload,
            Algorithm = result.Header?.Let(h => { try { return JsonSerializer.Deserialize<JsonElement>(h).GetProperty("alg").GetString() ?? string.Empty; } catch { return string.Empty; } })
        });
    }
}

public class JwtHmacRequest { public string Payload { get; set; } = ""; public string Secret { get; set; } = ""; }
public class JwtRsaRequest { public string Payload { get; set; } = ""; public string PrivateKey { get; set; } = ""; public string? Password { get; set; } }
public class JwtVerifyHmacRequest { public string Token { get; set; } = ""; public string Secret { get; set; } = ""; }
public class JwtVerifyRsaRequest { public string Token { get; set; } = ""; public string PublicKey { get; set; } = ""; }
public class JwtVerifyResultDto { public bool IsVerified { get; set; } public string? Header { get; set; } public string? Payload { get; set; } public string? Algorithm { get; set; } }

static class LetExtension
{
    public static TResult? Let<T, TResult>(this T? value, Func<T, TResult> action) where T : notnull where TResult : notnull
    {
        if (value is null) return default;
        return action(value);
    }
}
