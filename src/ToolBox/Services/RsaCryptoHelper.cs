using SharpDevLib;
using System.Security.Cryptography;
using System.Text;

namespace ToolBox.Services;

/// <summary>
/// RSA加密/解密、签名/验签帮助类
/// </summary>
public static class RsaCryptoHelper
{
    #region 便捷方法（基于PEM）

    /// <summary>
    /// 使用公钥PEM加密字符串
    /// </summary>
    /// <param name="publicKeyPem">公钥PEM</param>
    /// <param name="plaintext">要加密的字符串</param>
    /// <param name="padding">填充模式</param>
    /// <returns>Base64编码的加密数据</returns>
    public static string RsaEncrypt(string publicKeyPem, string plaintext, RSAEncryptionPadding padding)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(publicKeyPem);
        var data = Encoding.UTF8.GetBytes(plaintext);
        var encrypted = rsa.Encrypt(data, padding);
        return Convert.ToBase64String(encrypted);
    }

    /// <summary>
    /// 使用私钥PEM解密字符串
    /// </summary>
    /// <param name="privateKeyPem">私钥PEM</param>
    /// <param name="ciphertext">Base64编码的加密字符串</param>
    /// <param name="padding">填充模式</param>
    /// <param name="password">密码（仅当PEM格式为受密码保护的私钥时适用）</param>
    /// <returns>解密后的字符串</returns>
    public static string RsaDecrypt(string privateKeyPem, string ciphertext, RSAEncryptionPadding padding, byte[]? password = null)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(privateKeyPem, password);
        var data = Convert.FromBase64String(ciphertext);
        var decrypted = rsa.Decrypt(data, padding);
        return Encoding.UTF8.GetString(decrypted);
    }

    /// <summary>
    /// 使用私钥PEM对字符串进行签名
    /// </summary>
    /// <param name="privateKeyPem">私钥PEM</param>
    /// <param name="data">要签名的字符串</param>
    /// <param name="hashAlgorithm">哈希算法</param>
    /// <param name="padding">填充模式</param>
    /// <param name="password">密码（仅当PEM格式为受密码保护的私钥时适用）</param>
    /// <returns>Base64编码的签名数据</returns>
    public static string RsaSign(string privateKeyPem, string data, HashAlgorithmName hashAlgorithm, RSASignaturePadding padding, byte[]? password = null)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(privateKeyPem, password);
        var bytes = Encoding.UTF8.GetBytes(data);
        var signature = rsa.SignData(bytes, hashAlgorithm, padding);
        return Convert.ToBase64String(signature);
    }

    /// <summary>
    /// 使用公钥PEM验证字符串签名
    /// </summary>
    /// <param name="publicKeyPem">公钥PEM</param>
    /// <param name="data">原始字符串</param>
    /// <param name="signature">Base64编码的签名数据</param>
    /// <param name="hashAlgorithm">哈希算法</param>
    /// <param name="padding">填充模式</param>
    /// <returns>如果签名验证成功返回true，否则返回false</returns>
    public static bool RsaVerify(string publicKeyPem, string data, string signature, HashAlgorithmName hashAlgorithm, RSASignaturePadding padding)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(publicKeyPem);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        var signatureBytes = Convert.FromBase64String(signature);
        return rsa.VerifyData(dataBytes, signatureBytes, hashAlgorithm, padding);
    }

    /// <summary>
    /// 创建RSA加密填充
    /// </summary>
    /// <param name="paddingType">填充类型</param>
    /// <returns>RSA加密填充实例</returns>
    public static RSAEncryptionPadding CreateRsaEncryptionPadding(string paddingType)
    {
        return paddingType.ToUpper() switch
        {
            "OAEP-SHA1" => RSAEncryptionPadding.OaepSHA1,
            "OAEP-SHA256" => RSAEncryptionPadding.OaepSHA256,
            "OAEP-SHA384" => RSAEncryptionPadding.OaepSHA384,
            "OAEP-SHA512" => RSAEncryptionPadding.OaepSHA512,
            "PKCS1" => RSAEncryptionPadding.Pkcs1,
            _ => throw new NotSupportedException($"不支持的RSA加密填充类型: {paddingType}")
        };
    }

    /// <summary>
    /// 创建RSA签名填充
    /// </summary>
    /// <param name="paddingType">填充类型</param>
    /// <returns>RSA签名填充实例</returns>
    public static RSASignaturePadding CreateRsaSignaturePadding(string paddingType)
    {
        return paddingType.ToUpper() switch
        {
            "PKCS1" => RSASignaturePadding.Pkcs1,
            "PSS" => RSASignaturePadding.Pss,
            _ => throw new NotSupportedException($"不支持的RSA签名填充类型: {paddingType}")
        };
    }

    /// <summary>
    /// 创建哈希算法名称
    /// </summary>
    /// <param name="hashAlgorithm">哈希算法字符串</param>
    /// <returns>哈希算法名称实例</returns>
    public static HashAlgorithmName CreateHashAlgorithmName(string hashAlgorithm)
    {
        return hashAlgorithm.ToUpper() switch
        {
            "SHA1" => HashAlgorithmName.SHA1,
            "SHA256" => HashAlgorithmName.SHA256,
            "SHA384" => HashAlgorithmName.SHA384,
            "SHA512" => HashAlgorithmName.SHA512,
            "MD5" => HashAlgorithmName.MD5,
            _ => throw new NotSupportedException($"不支持的哈希算法: {hashAlgorithm}")
        };
    }

    #endregion
}