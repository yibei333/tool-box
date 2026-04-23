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

    [HttpPost("rsa/key-info")]
    public DataReply<RsaKeyInfoResult> RsaKeyInfo([FromBody] RsaKeyInfoRequest request)
    {
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        var info = RsaKeyHelper.GetKeyInfo(request.Key, password);
        return DataReply.Succeed(new RsaKeyInfoResult
        {
            Type = info.Type.ToString(),
            IsPrivate = info.IsPrivate,
            IsEncrypted = info.IsEncrypted,
            KeySize = info.KeySize
        });
    }

    [HttpPost("rsa/encrypt")]
    public DataReply<string> RsaEncrypt([FromBody] RsaEncryptRequest request)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(request.PublicKey);
        var data = Encoding.UTF8.GetBytes(request.Plaintext);
        var encrypted = rsa.Encrypt(data, RSAEncryptionPadding.OaepSHA256);
        return DataReply.Succeed(Convert.ToBase64String(encrypted));
    }

    [HttpPost("rsa/decrypt")]
    public DataReply<string> RsaDecrypt([FromBody] RsaDecryptRequest request)
    {
        using var rsa = RSA.Create();
        var password = string.IsNullOrEmpty(request.Password) ? null : Encoding.UTF8.GetBytes(request.Password);
        rsa.ImportPem(request.PrivateKey, password);
        var data = Convert.FromBase64String(request.Ciphertext);
        var decrypted = rsa.Decrypt(data, RSAEncryptionPadding.OaepSHA256);
        return DataReply.Succeed(Encoding.UTF8.GetString(decrypted));
    }

    [HttpPost("aes/encrypt")]
    public DataReply<string> AesEncrypt([FromBody] SymmetricEncryptRequest request)
    {
        using var aes = Aes.Create();
        aes.Padding = PaddingMode.PKCS7;
        aes.SetKeyAutoPad(Encoding.UTF8.GetBytes(request.Key));
        if (!string.IsNullOrEmpty(request.Iv)) aes.SetIVAutoPad(Encoding.UTF8.GetBytes(request.Iv));
        var data = Encoding.UTF8.GetBytes(request.Plaintext);
        var encrypted = aes.Encrypt(data);
        return DataReply.Succeed(Convert.ToBase64String(encrypted));
    }

    [HttpPost("aes/decrypt")]
    public DataReply<string> AesDecrypt([FromBody] SymmetricDecryptRequest request)
    {
        using var aes = Aes.Create();
        aes.SetKeyAutoPad(Encoding.UTF8.GetBytes(request.Key));
        if (!string.IsNullOrEmpty(request.Iv)) aes.SetIVAutoPad(Encoding.UTF8.GetBytes(request.Iv));
        var data = Convert.FromBase64String(request.Ciphertext);
        var decrypted = aes.Decrypt(data);
        return DataReply.Succeed(Encoding.UTF8.GetString(decrypted));
    }

    [HttpPost("des/encrypt")]
    public DataReply<string> DesEncrypt([FromBody] SymmetricEncryptRequest request)
    {
        using var des = DES.Create();
        des.SetKeyAutoPad(Encoding.UTF8.GetBytes(request.Key));
        if (!string.IsNullOrEmpty(request.Iv)) des.SetIVAutoPad(Encoding.UTF8.GetBytes(request.Iv));
        var data = Encoding.UTF8.GetBytes(request.Plaintext);
        var encrypted = des.Encrypt(data);
        return DataReply.Succeed(Convert.ToBase64String(encrypted));
    }

    [HttpPost("des/decrypt")]
    public DataReply<string> DesDecrypt([FromBody] SymmetricDecryptRequest request)
    {
        using var des = DES.Create();
        des.SetKeyAutoPad(Encoding.UTF8.GetBytes(request.Key));
        if (!string.IsNullOrEmpty(request.Iv)) des.SetIVAutoPad(Encoding.UTF8.GetBytes(request.Iv));
        var data = Convert.FromBase64String(request.Ciphertext);
        var decrypted = des.Decrypt(data);
        return DataReply.Succeed(Encoding.UTF8.GetString(decrypted));
    }

    [HttpPost("rsa/convert-to-xml")]
    public DataReply<string> RsaConvertToXml([FromBody] RsaConvertXmlRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var xml = RsaXmlHelper.ConvertPemToXml(request.Pem, request.IncludePrivateParameters);
        return DataReply.Succeed(xml);
    }

    [HttpPost("rsa/convert-from-xml")]
    public DataReply<string> RsaConvertFromXml([FromBody] RsaConvertFromXmlRequest request)
    {
        if (request.Xml.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入XML密钥");
        var pem = RsaXmlHelper.ConvertXmlToPem(request.Xml, request.TargetFormat, request.EncryptAlgorithm);
        return DataReply.Succeed(pem);
    }

    [HttpPost("rsa/add-password")]
    public DataReply<string> RsaAddPassword([FromBody] RsaAddPasswordRequest request)
    {
        if (request.Pem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        if (string.IsNullOrEmpty(request.Password)) return DataReply.Succeed("请输入密码");
        var passwordBytes = Encoding.UTF8.GetBytes(request.Password);
        var encryptedPem = RsaPasswordHelper.AddPasswordToPem(request.Pem, passwordBytes, request.TargetEncryptedType, request.Algorithm);
        return DataReply.Succeed(encryptedPem);
    }

    [HttpPost("rsa/remove-password")]
    public DataReply<string> RsaRemovePassword([FromBody] RsaRemovePasswordRequest request)
    {
        if (request.EncryptedPem.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入加密的密钥");
        if (string.IsNullOrEmpty(request.Password)) return DataReply.Succeed("请输入密码");
        var passwordBytes = Encoding.UTF8.GetBytes(request.Password);
        var pem = RsaPasswordHelper.RemovePasswordFromPem(request.EncryptedPem, passwordBytes);
        return DataReply.Succeed(pem);
    }

    [HttpPost("rsa/encrypt-enhanced")]
    public DataReply<string> RsaEncryptEnhanced([FromBody] RsaEncryptEnhancedRequest request)
    {
        if (request.PublicKey.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入公钥");
        if (request.Plaintext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入明文");
        var padding = RsaCryptoHelper.CreateRsaEncryptionPadding(request.Padding);
        var ciphertext = RsaCryptoHelper.RsaEncrypt(request.PublicKey, request.Plaintext, padding);
        return DataReply.Succeed(ciphertext);
    }

    [HttpPost("rsa/decrypt-enhanced")]
    public DataReply<string> RsaDecryptEnhanced([FromBody] RsaDecryptEnhancedRequest request)
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

    [HttpPost("rsa/verify")]
    public DataReply<bool> RsaVerify([FromBody] RsaVerifyRequest request)
    {
        if (request.PublicKey.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        if (request.Data.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        if (request.Signature.IsNullOrWhiteSpace()) return DataReply.Succeed(false);
        var hashAlgorithm = RsaCryptoHelper.CreateHashAlgorithmName(request.HashAlgorithm);
        var padding = RsaCryptoHelper.CreateRsaSignaturePadding(request.Padding);
        var verified = RsaCryptoHelper.RsaVerify(request.PublicKey, request.Data, request.Signature, hashAlgorithm, padding);
        return DataReply.Succeed(verified);
    }

    [HttpPost("aes/encrypt-enhanced")]
    public DataReply<string> AesEncryptEnhanced([FromBody] SymmetricEncryptEnhancedRequest request)
    {
        if (request.Plaintext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入明文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var ciphertext = SymmetricCryptoHelper.AesEncrypt(request.Plaintext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(ciphertext);
    }

    [HttpPost("aes/decrypt-enhanced")]
    public DataReply<string> AesDecryptEnhanced([FromBody] SymmetricDecryptEnhancedRequest request)
    {
        if (request.Ciphertext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var plaintext = SymmetricCryptoHelper.AesDecrypt(request.Ciphertext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(plaintext);
    }

    [HttpPost("des/encrypt-enhanced")]
    public DataReply<string> DesEncryptEnhanced([FromBody] SymmetricEncryptEnhancedRequest request)
    {
        if (request.Plaintext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入明文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var ciphertext = SymmetricCryptoHelper.DesEncrypt(request.Plaintext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(ciphertext);
    }

    [HttpPost("des/decrypt-enhanced")]
    public DataReply<string> DesDecryptEnhanced([FromBody] SymmetricDecryptEnhancedRequest request)
    {
        if (request.Ciphertext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var plaintext = SymmetricCryptoHelper.DesDecrypt(request.Ciphertext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(plaintext);
    }

    [HttpPost("3des/encrypt")]
    public DataReply<string> TripleDesEncrypt([FromBody] SymmetricEncryptEnhancedRequest request)
    {
        if (request.Plaintext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入明文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var ciphertext = SymmetricCryptoHelper.TripleDesEncrypt(request.Plaintext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(ciphertext);
    }

    [HttpPost("3des/decrypt")]
    public DataReply<string> TripleDesDecrypt([FromBody] SymmetricDecryptEnhancedRequest request)
    {
        if (request.Ciphertext.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密文");
        if (request.Key.IsNullOrWhiteSpace()) return DataReply.Succeed("请输入密钥");
        var mode = SymmetricCryptoHelper.CreateCipherMode(request.Mode);
        var padding = SymmetricCryptoHelper.CreatePaddingMode(request.Padding);
        var plaintext = SymmetricCryptoHelper.TripleDesDecrypt(request.Ciphertext, request.Key, mode, padding, request.Iv);
        return DataReply.Succeed(plaintext);
    }
}

public class RsaGenerateRequest { public int KeySize { get; set; } = 2048; }
public class RsaKeyPairResult { public string PrivateKey { get; set; } = ""; public string PublicKey { get; set; } = ""; }
public class RsaCompareRequest { public string PrivateKey { get; set; } = ""; public string PublicKey { get; set; } = ""; }
public class RsaConvertPemRequest { public string Pem { get; set; } = ""; public string TargetFormat { get; set; } = "pkcs8"; public string? Password { get; set; } }
public class RsaKeyInfoRequest { public string Key { get; set; } = ""; public string? Password { get; set; } }
public class RsaKeyInfoResult { public string Type { get; set; } = ""; public bool IsPrivate { get; set; } public bool IsEncrypted { get; set; } public int KeySize { get; set; } }
public class RsaEncryptRequest { public string PublicKey { get; set; } = ""; public string Plaintext { get; set; } = ""; }
public class RsaDecryptRequest { public string PrivateKey { get; set; } = ""; public string Ciphertext { get; set; } = ""; public string? Password { get; set; } }
public class SymmetricEncryptRequest { public string Plaintext { get; set; } = ""; public string Key { get; set; } = ""; public string? Iv { get; set; } }
public class SymmetricDecryptRequest { public string Ciphertext { get; set; } = ""; public string Key { get; set; } = ""; public string? Iv { get; set; } }

public class RsaConvertXmlRequest { public string Pem { get; set; } = ""; public bool IncludePrivateParameters { get; set; } = false; }
public class RsaConvertFromXmlRequest { public string Xml { get; set; } = ""; public SharpDevLib.PemType TargetFormat { get; set; } = SharpDevLib.PemType.Pkcs8PrivateKey; public string EncryptAlgorithm { get; set; } = "AES-256-CBC"; }
public class RsaAddPasswordRequest { public string Pem { get; set; } = ""; public string Password { get; set; } = ""; public SharpDevLib.PemType TargetEncryptedType { get; set; } = SharpDevLib.PemType.EncryptedPkcs8PrivateKey; public string Algorithm { get; set; } = "AES-256-CBC"; }
public class RsaRemovePasswordRequest { public string EncryptedPem { get; set; } = ""; public string Password { get; set; } = ""; }
public class RsaEncryptEnhancedRequest { public string PublicKey { get; set; } = ""; public string Plaintext { get; set; } = ""; public string Padding { get; set; } = "OAEP-SHA256"; }
public class RsaDecryptEnhancedRequest { public string PrivateKey { get; set; } = ""; public string Ciphertext { get; set; } = ""; public string Padding { get; set; } = "OAEP-SHA256"; public string? Password { get; set; } }
public class RsaSignRequest { public string PrivateKey { get; set; } = ""; public string Data { get; set; } = ""; public string HashAlgorithm { get; set; } = "SHA256"; public string Padding { get; set; } = "PKCS1"; public string? Password { get; set; } }
public class RsaVerifyRequest { public string PublicKey { get; set; } = ""; public string Data { get; set; } = ""; public string Signature { get; set; } = ""; public string HashAlgorithm { get; set; } = "SHA256"; public string Padding { get; set; } = "PKCS1"; }
public class SymmetricEncryptEnhancedRequest { public string Plaintext { get; set; } = ""; public string Key { get; set; } = ""; public string Mode { get; set; } = "CBC"; public string Padding { get; set; } = "PKCS7"; public string? Iv { get; set; } }
public class SymmetricDecryptEnhancedRequest { public string Ciphertext { get; set; } = ""; public string Key { get; set; } = ""; public string Mode { get; set; } = "CBC"; public string Padding { get; set; } = "PKCS7"; public string? Iv { get; set; } }
