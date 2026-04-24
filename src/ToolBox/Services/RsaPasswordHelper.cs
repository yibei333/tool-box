using SharpDevLib;
using System.Security.Cryptography;

namespace ToolBox.Services;

/// <summary>
/// RSA密码管理帮助类
/// </summary>
public static class RsaPasswordHelper
{
    /// <summary>
    /// 为PEM格式的RSA密钥添加密码保护
    /// </summary>
    /// <param name="pem">PEM格式的密钥（必须是未加密的私钥）</param>
    /// <param name="password">密码</param>
    /// <param name="targetEncryptedType">目标加密类型（必须是EncryptedPkcs1PrivateKey或EncryptedPkcs8PrivateKey）</param>
    /// <param name="algorithm">加密算法（仅当targetEncryptedType为EncryptedPkcs1PrivateKey时适用），支持的算法：AES-256-CBC, DES-EDE3-CBC</param>
    /// <returns>加密后的PEM格式密钥字符串</returns>
    /// <exception cref="ArgumentException">当pem不是私钥或targetEncryptedType无效时引发</exception>
    public static string AddPasswordToPem(string pem, byte[] password, PemType targetEncryptedType, string algorithm = "AES-256-CBC")
    {
        if (targetEncryptedType != PemType.EncryptedPkcs1PrivateKey && targetEncryptedType != PemType.EncryptedPkcs8PrivateKey)
        {
            throw new ArgumentException($"目标加密类型必须是EncryptedPkcs1PrivateKey或EncryptedPkcs8PrivateKey，当前为：{targetEncryptedType}");
        }

        var info = RsaKeyHelper.GetKeyInfo(pem);
        if (!info.IsPrivate)
        {
            throw new ArgumentException("PEM格式不是私钥，无法添加密码保护");
        }

        // 如果已经是加密的PEM，先解密
        byte[]? currentPassword = null;
        if (info.Type == PemType.EncryptedPkcs1PrivateKey || info.Type == PemType.EncryptedPkcs8PrivateKey)
        {
            throw new ArgumentException("PEM已经是加密格式，请先使用RemovePasswordFromPem移除密码");
        }

        using var rsa = RSA.Create();
        rsa.ImportPem(pem, currentPassword);
        return rsa.ExportPem(targetEncryptedType, password, algorithm);
    }

    /// <summary>
    /// 从加密的PEM格式RSA密钥中移除密码保护
    /// </summary>
    /// <param name="encryptedPem">加密的PEM格式密钥</param>
    /// <param name="password">密码</param>
    /// <returns>未加密的PEM格式密钥字符串</returns>
    /// <exception cref="ArgumentException">当encryptedPem不是加密的私钥时引发</exception>
    public static string RemovePasswordFromPem(string encryptedPem, byte[] password)
    {
        var info = RsaKeyHelper.GetKeyInfo(encryptedPem);
        if (info.Type != PemType.EncryptedPkcs1PrivateKey && info.Type != PemType.EncryptedPkcs8PrivateKey)
        {
            throw new ArgumentException($"PEM格式不是加密的私钥，当前类型为：{info.Type}");
        }

        // 确定目标未加密类型
        PemType targetType = info.Type == PemType.EncryptedPkcs1PrivateKey
            ? PemType.Pkcs1PrivateKey
            : PemType.Pkcs8PrivateKey;

        using var rsa = RSA.Create();
        rsa.ImportPem(encryptedPem, password);
        return rsa.ExportPem(targetType);
    }
}