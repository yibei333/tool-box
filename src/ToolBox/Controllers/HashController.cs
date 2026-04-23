using Microsoft.AspNetCore.Mvc;
using SharpDevLib;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HashController : ControllerBase
{
    [HttpPost("compute")]
    public DataReply<string> Compute([FromBody] HashRequest request)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(request.Text);
        var hash = request.Algorithm.ToLower() switch
        {
            "md5" => bytes.Md5(),
            "sha1" => bytes.Sha128(),
            "sha256" => bytes.Sha256(),
            "sha384" => bytes.Sha384(),
            "sha512" => bytes.Sha512(),
            _ => throw new NotSupportedException($"不支持的算法: {request.Algorithm}")
        };
        return DataReply.Succeed(hash);
    }

    [HttpPost("hmac")]
    public DataReply<string> Hmac([FromBody] HmacRequest request)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(request.Text);
        var key = System.Text.Encoding.UTF8.GetBytes(request.Key);
        var hash = request.Algorithm.ToLower() switch
        {
            "hmac-md5" => bytes.HmacMd5(key),
            "hmac-sha1" => bytes.HmacSha128(key),
            "hmac-sha256" => bytes.HmacSha256(key),
            "hmac-sha384" => bytes.HmacSha384(key),
            "hmac-sha512" => bytes.HmacSha512(key),
            _ => throw new NotSupportedException($"不支持的算法: {request.Algorithm}")
        };
        return DataReply.Succeed(hash);
    }
}

public class HashRequest
{
    public string Text { get; set; } = "";
    public string Algorithm { get; set; } = "sha256";
}

public class HmacRequest
{
    public string Text { get; set; } = "";
    public string Key { get; set; } = "";
    public string Algorithm { get; set; } = "hmac-sha256";
}
