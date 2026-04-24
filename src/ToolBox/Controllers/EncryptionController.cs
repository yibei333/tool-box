using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Security.Cryptography;
using System.Text;
using ToolBox.Services;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncryptionController : ControllerBase
{
    [HttpPost("rsa/generate")]
    public DataReply<RsaKeyPairResult> RsaGenerate([FromBody] RsaGenerateRequest request)
    {
        using var rsa = RSA.Create(request.KeySize);
        var privateKey = rsa.ExportPem(PemType.Pkcs8PrivateKey);
        var publicKey = rsa.ExportPem(PemType.X509SubjectPublicKey);
        return DataReply.Succeed(new RsaKeyPairResult { PrivateKey = privateKey, PublicKey = publicKey });
    }

    [HttpPost("rsa/compare")]
    public DataReply<bool> RsaCompare([FromBody] RsaCompareRequest request)
    {
        if (request.PrivateKey.IsNullOrWhiteSpace() || request.PublicKey.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        var match = RsaKeyHelper.IsKeyPairMatch(request.PrivateKey, request.PublicKey);
        return DataReply.Succeed(match);
    }

    [HttpPost("rsa/convert-pem")]
    public DataReply<string> RsaConvertPem([FromBody] RsaConvertPemRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        using var rsa = RSA.Create();
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        rsa.ImportPem(request.Pem, password);

        var targetType = request.TargetFormat.ToLower() switch
        {
            "pkcs1" => PemType.Pkcs1PrivateKey,
            "pkcs8" => PemType.Pkcs8PrivateKey,
            "public" => PemType.X509SubjectPublicKey,
            _ => throw new NotSupportedException($"不支持的目标格式: {request.TargetFormat}")
        };

        var result = rsa.ExportPem(targetType);
        return DataReply.Succeed(result);
    }

    [HttpPost("rsa/convert-to-xml")]
    public DataReply<string> RsaConvertToXml([FromBody] RsaConvertToXmlRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var xml = RsaXmlHelper.ConvertPemToXml(request.Pem, request.IncludePrivateParams);
        return DataReply.Succeed(xml);
    }

    [HttpPost("rsa/convert-from-xml")]
    public DataReply<string> RsaConvertFromXml([FromBody] RsaConvertFromXmlRequest request)
    {
        if (request.Xml.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入XML密钥");
        if (request.TargetFormat.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入目标格式");
        var pemType = PemType.Pkcs1PrivateKey;
        if (request.TargetFormat.Equals("pkcs8")) pemType = PemType.Pkcs8PrivateKey;
        else if (request.TargetFormat.Equals("public")) pemType = PemType.X509SubjectPublicKey;
        var pem = RsaXmlHelper.ConvertXmlToPem(request.Xml, pemType);
        return DataReply.Succeed(pem);
    }

    [HttpPost("rsa/add-password")]
    public DataReply<string> RsaAddPassword([FromBody] RsaAddPasswordRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        if (request.Password.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密码");
        if (request.TargetEncryptedType.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入目标格式");
        var passwordBytes = Encoding.UTF8.GetBytes(request.Password);
        var targetPemType = PemType.EncryptedPkcs1PrivateKey;
        if (request.TargetEncryptedType.Equals("EncryptedPkcs8PrivateKey")) targetPemType = PemType.EncryptedPkcs8PrivateKey;
        var encryptedPem = RsaPasswordHelper.AddPasswordToPem(request.Pem, passwordBytes, targetPemType, request.Algorithm);
        return DataReply.Succeed(encryptedPem);
    }

    [HttpPost("rsa/remove-password")]
    public DataReply<string> RsaRemovePassword([FromBody] RsaRemovePasswordRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入加密的密钥");
        if (string.IsNullOrEmpty(request.Password)) return DataReply.Succeed("请输入密码");
        var passwordBytes = Encoding.UTF8.GetBytes(request.Password);
        var pem = RsaPasswordHelper.RemovePasswordFromPem(request.Pem, passwordBytes);
        return DataReply.Succeed(pem);
    }

    [HttpPost("rsa/encrypt")]
    public DataReply<string> RsaEncrypt([FromBody] RsaEncryptRequest request)
    {
        if (request.PublicKey.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入公钥");
        if (request.Plaintext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入明文");
        var padding = RsaCryptoHelper.CreateRsaEncryptionPadding(request.Padding);
        var ciphertext = RsaCryptoHelper.RsaEncrypt(request.PublicKey, request.Plaintext, padding);
        return DataReply.Succeed(ciphertext);
    }

    [HttpPost("rsa/decrypt")]
    public DataReply<string> RsaDecrypt([FromBody] RsaDecryptRequest request)
    {
        if (request.PrivateKey.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入私钥");
        if (request.Ciphertext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密文");
        var padding = RsaCryptoHelper.CreateRsaEncryptionPadding(request.Padding);
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        var plaintext = RsaCryptoHelper.RsaDecrypt(request.PrivateKey, request.Ciphertext, padding, password);
        return DataReply.Succeed(plaintext);
    }

    [HttpPost("rsa/sign")]
    public DataReply<string> RsaSign([FromBody] RsaSignRequest request)
    {
        if (request.PrivateKey.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入私钥");
        if (request.Data.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入要签名的数据");
        var hashAlgorithm = RsaCryptoHelper.CreateHashAlgorithmName(request.HashAlgorithm);
        var padding = RsaCryptoHelper.CreateRsaSignaturePadding(request.Padding);
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        var signature = RsaCryptoHelper.RsaSign(request.PrivateKey, request.Data, hashAlgorithm, padding, password);
        return DataReply.Succeed(signature);
    }

    [HttpPost("rsa/verify-sign")]
    public DataReply<bool> RsaVerifySign([FromBody] RsaVerifySignRequest request)
    {
        if (request.PublicKey.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        if (request.Data.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        if (request.Signature.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        var hashAlgorithm = RsaCryptoHelper.CreateHashAlgorithmName(request.HashAlgorithm);
        var padding = RsaCryptoHelper.CreateRsaSignaturePadding(request.Padding);
        var verified = RsaCryptoHelper.RsaVerify(request.PublicKey, request.Data, request.Signature, hashAlgorithm, padding);
        return DataReply.Succeed(verified);
    }

    [HttpPost("aes/encrypt")]
    public DataReply<string> AesEncrypt([FromBody] SymmetricEncryptRequest request)
    {
        using var algorithm = Aes.Create();
        return SymmetricEncrypt(algorithm, request);
    }

    [HttpPost("aes/decrypt")]
    public DataReply<string> AesDecrypt([FromBody] SymmetricDecryptRequest request)
    {
        using var algorithm = Aes.Create();
        return SymmetricDecrypt(algorithm, request);
    }

    [HttpPost("des/encrypt")]
    public DataReply<string> DesEncrypt([FromBody] SymmetricEncryptRequest request)
    {
        using var algorithm = DES.Create();
        return SymmetricEncrypt(algorithm, request);
    }

    [HttpPost("des/decrypt")]
    public DataReply<string> DesDecrypt([FromBody] SymmetricDecryptRequest request)
    {
        using var algorithm = DES.Create();
        return SymmetricDecrypt(algorithm, request);
    }

    [HttpPost("tripledes/encrypt")]
    public DataReply<string> TripleDesEncrypt([FromBody] SymmetricEncryptRequest request)
    {
        using var algorithm = TripleDES.Create();
        return SymmetricEncrypt(algorithm, request);
    }

    [HttpPost("tripledes/decrypt")]
    public DataReply<string> TripleDesDecrypt([FromBody] SymmetricDecryptRequest request)
    {
        using var algorithm = TripleDES.Create();
        return SymmetricDecrypt(algorithm, request);
    }

    static DataReply<string> SymmetricEncrypt(SymmetricAlgorithm algorithm, SymmetricEncryptRequest request)
    {
        algorithm.Mode = request.Mode.ToEnum<CipherMode>();
        algorithm.Padding = request.Padding.ToEnum<PaddingMode>();
        algorithm.SetKeyAutoPad(request.Key.Utf8Decode());
        algorithm.SetIVAutoPad(request.Iv?.Utf8Decode() ?? []);
        var encrypted = algorithm.Encrypt(request.Plaintext.Utf8Decode());
        return DataReply.Succeed(encrypted.Base64Encode());
    }

    static DataReply<string> SymmetricDecrypt(SymmetricAlgorithm algorithm, SymmetricDecryptRequest request)
    {
        algorithm.Mode = request.Mode.ToEnum<CipherMode>();
        algorithm.Padding = request.Padding.ToEnum<PaddingMode>();
        algorithm.SetKeyAutoPad(request.Key.Utf8Decode());
        algorithm.SetIVAutoPad(request.Iv?.Utf8Decode() ?? []);
        var plainBytes = algorithm.Decrypt(request.Ciphertext.Base64Decode());
        return DataReply.Succeed(plainBytes.Utf8Encode());
    }
}

public class RsaGenerateRequest { public int KeySize { get; set; } = 2048; }
public class RsaKeyPairResult { public string PrivateKey { get; set; } = ""; public string PublicKey { get; set; } = ""; }
public class RsaCompareRequest { public string PrivateKey { get; set; } = ""; public string PublicKey { get; set; } = ""; }
public class RsaConvertPemRequest { public string Pem { get; set; } = ""; public string TargetFormat { get; set; } = "pkcs8"; public string? Password { get; set; } }
public class RsaConvertToXmlRequest { public string Pem { get; set; } = ""; public bool IncludePrivateParams { get; set; } = false; }
public class RsaConvertFromXmlRequest { public string Xml { get; set; } = ""; public string? TargetFormat { get; set; } }
public class RsaAddPasswordRequest { public string Pem { get; set; } = ""; public string Password { get; set; } = ""; public string? TargetEncryptedType { get; set; } public string Algorithm { get; set; } = "AES-256-CBC"; }
public class RsaRemovePasswordRequest { public string Pem { get; set; } = ""; public string Password { get; set; } = ""; }
public class RsaEncryptRequest { public string PublicKey { get; set; } = ""; public string Plaintext { get; set; } = ""; public string Padding { get; set; } = "OAEP-SHA256"; }
public class RsaDecryptRequest { public string PrivateKey { get; set; } = ""; public string Ciphertext { get; set; } = ""; public string Padding { get; set; } = "OAEP-SHA256"; public string? Password { get; set; } }
public class RsaSignRequest { public string PrivateKey { get; set; } = ""; public string Data { get; set; } = ""; public string HashAlgorithm { get; set; } = "SHA256"; public string Padding { get; set; } = "PKCS1"; public string? Password { get; set; } }
public class RsaVerifySignRequest { public string PublicKey { get; set; } = ""; public string Data { get; set; } = ""; public string Signature { get; set; } = ""; public string HashAlgorithm { get; set; } = "SHA256"; public string Padding { get; set; } = "PKCS1"; }
public class SymmetricEncryptRequest { public string Plaintext { get; set; } = ""; public string Key { get; set; } = ""; public string Mode { get; set; } = "CBC"; public string Padding { get; set; } = "PKCS7"; public string? Iv { get; set; } }
public class SymmetricDecryptRequest { public string Ciphertext { get; set; } = ""; public string Key { get; set; } = ""; public string Mode { get; set; } = "CBC"; public string Padding { get; set; } = "PKCS7"; public string? Iv { get; set; } }
