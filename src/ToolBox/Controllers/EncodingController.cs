using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Text;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncodingController : ControllerBase
{
    [HttpPost("url-encode")]
    public DataReply<string> UrlEncode([FromBody] EncodingRequest request)
    {
        return DataReply.Succeed(Uri.EscapeDataString(request.Text));
    }

    [HttpPost("url-decode")]
    public DataReply<string> UrlDecode([FromBody] EncodingRequest request)
    {
        return DataReply.Succeed(Uri.UnescapeDataString(request.Text));
    }

    [HttpPost("base64-encode")]
    public DataReply<string> Base64Encode([FromBody] EncodingRequest request)
    {
        var bytes = Encoding.UTF8.GetBytes(request.Text);
        return DataReply.Succeed(bytes.Base64Encode());
    }

    [HttpPost("base64-decode")]
    public DataReply<string> Base64Decode([FromBody] EncodingRequest request)
    {
        var bytes = request.Text.Base64Decode();
        return DataReply.Succeed(Encoding.UTF8.GetString(bytes));
    }

    [HttpPost("base64url-encode")]
    public DataReply<string> Base64UrlEncode([FromBody] EncodingRequest request)
    {
        var bytes = Encoding.UTF8.GetBytes(request.Text);
        return DataReply.Succeed(bytes.Base64UrlEncode());
    }

    [HttpPost("base64url-decode")]
    public DataReply<string> Base64UrlDecode([FromBody] EncodingRequest request)
    {
        var bytes = request.Text.Base64UrlDecode();
        return DataReply.Succeed(Encoding.UTF8.GetString(bytes));
    }

    [HttpPost("utf8-encode")]
    public DataReply<string> Utf8Encode([FromBody] ByteArrayRequest request)
    {
        return DataReply.Succeed(request.Data.Select(x => (byte)x).ToArray().Utf8Encode());
    }

    [HttpPost("utf8-decode")]
    public DataReply<string> Utf8Decode([FromBody] EncodingRequest request)
    {
        return DataReply.Succeed(string.Join(" ", request.Text.Utf8Decode()));
    }

    [HttpPost("hex-encode")]
    public DataReply<string> HexEncode([FromBody] ByteArrayRequest request)
    {
        return DataReply.Succeed(request.Data.Select(x => (byte)x).ToArray().HexStringEncode());
    }

    [HttpPost("hex-decode")]
    public DataReply<string> HexDecode([FromBody] EncodingRequest request)
    {
        return DataReply.Succeed(string.Join(" ", request.Text.HexStringDecode()));
    }
}

public class EncodingRequest
{
    public string Text { get; set; } = "";
}

public class ByteArrayRequest
{
    public int[] Data { get; set; } = [];
}
