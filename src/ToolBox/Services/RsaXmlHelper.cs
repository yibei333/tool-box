using SharpDevLib;
using System.Security.Cryptography;

namespace ToolBox.Services;

/// <summary>
/// RSA XML格式密钥帮助类
/// </summary>
public static class RsaXmlHelper
{
    /// <summary>
    /// 将RSA密钥导出为XML字符串
    /// </summary>
    /// <param name="rsa">RSA算法实例</param>
    /// <param name="includePrivateParameters">是否包含私钥参数</param>
    /// <returns>XML格式的密钥字符串</returns>
    public static string ToXmlString(RSA rsa, bool includePrivateParameters)
    {
#pragma warning disable SYSLIB0048 // ToXmlString和FromXmlString已过时，但为了兼容性仍使用
        return rsa.ToXmlString(includePrivateParameters);
#pragma warning restore SYSLIB0048
    }

    /// <summary>
    /// 从XML字符串导入RSA密钥
    /// </summary>
    /// <param name="rsa">RSA算法实例</param>
    /// <param name="xmlString">XML格式的密钥字符串</param>
    public static void FromXmlString(RSA rsa, string xmlString)
    {
#pragma warning disable SYSLIB0048
        rsa.FromXmlString(xmlString);
#pragma warning restore SYSLIB0048
    }

    /// <summary>
    /// 将PEM格式的RSA密钥转换为XML格式
    /// </summary>
    /// <param name="pem">PEM格式的密钥</param>
    /// <param name="includePrivateParameters">是否包含私钥参数（仅当PEM为私钥时有效）</param>
    /// <param name="password">密码（仅当PEM格式为受密码保护的私钥时适用）</param>
    /// <returns>XML格式的密钥字符串</returns>
    /// <exception cref="InvalidDataException">当PEM格式无效或密码错误时引发</exception>
    public static string ConvertPemToXml(string pem, bool includePrivateParameters = false, byte[]? password = null)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(pem, password);

        if (!includePrivateParameters)
        {
            // 如果只需要公钥，但PEM是私钥，我们仍然只导出公钥参数
            return ToXmlString(rsa, false);
        }

        var info = RsaKeyHelper.GetKeyInfo(pem);
        if (!info.IsPrivate)
        {
            throw new InvalidDataException("PEM格式不是私钥，无法导出私钥参数");
        }

        return ToXmlString(rsa, true);
    }

    /// <summary>
    /// 将XML格式的RSA密钥转换为PEM格式
    /// </summary>
    /// <param name="xml">XML格式的密钥字符串</param>
    /// <param name="targetType">目标PEM格式类型</param>
    /// <param name="password">密码（仅当目标格式为受密码保护的私钥时适用）</param>
    /// <param name="encryptAlgorithm">加密算法（仅当目标格式为受密码保护的PKCS#1私钥时适用），支持的算法：AES-256-CBC, DES-EDE3-CBC</param>
    /// <returns>PEM格式的密钥字符串</returns>
    /// <exception cref="NotSupportedException">当targetType不受支持时引发</exception>
    public static string ConvertXmlToPem(string xml, SharpDevLib.PemType targetType, string encryptAlgorithm = "AES-256-CBC")
    {
        using var rsa = RSA.Create();
        FromXmlString(rsa, xml);

        return rsa.ExportPem(targetType, null, encryptAlgorithm);
    }
}