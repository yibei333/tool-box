using SharpDevLib;
using System.Security.Cryptography;
using System.Xml;

namespace ToolBox.Services;

/// <summary>
/// RSA XML格式密钥帮助类
/// </summary>
public static class RsaXmlHelper
{
    /// <summary>
    /// 将PEM格式的RSA密钥转换为XML格式
    /// </summary>
    /// <param name="pem">PEM格式的密钥</param>
    /// <param name="includePrivateParameters">是否包含私钥参数（仅当PEM为私钥时有效）</param>
    /// <returns>XML格式的密钥字符串</returns>
    /// <exception cref="InvalidDataException">当PEM格式无效或密码错误时引发</exception>
    public static string ConvertPemToXml(string pem, bool includePrivateParameters = false)
    {
        using var rsa = RSA.Create();
        rsa.ImportPem(pem);
        if (!includePrivateParameters) return RsaParametersToXml(rsa.ExportParameters(false), false);
        var info = RsaKeyHelper.GetKeyInfo(pem);
        if (!info.IsPrivate) throw new InvalidDataException("PEM格式不是私钥，无法导出私钥参数");
        return RsaParametersToXml(rsa.ExportParameters(true), true);
    }

    /// <summary>
    /// 将XML格式的RSA密钥转换为PEM格式
    /// </summary>
    /// <param name="xml">XML格式的密钥字符串</param>
    /// <param name="targetType">目标PEM格式类型</param>
    /// <returns>PEM格式的密钥字符串</returns>
    /// <exception cref="NotSupportedException">当targetType不受支持时引发</exception>
    public static string ConvertXmlToPem(string xml, PemType targetType)
    {
        using var rsa = RSA.Create();
        var parameters = XmlToRsaParameters(xml);
        rsa.ImportParameters(parameters);
        return rsa.ExportPem(targetType);
    }

    static string RsaParametersToXml(RSAParameters p, bool includePrivate)
    {
        var doc = new XmlDocument();
        var root = doc.CreateElement("RSAKeyValue");
        doc.AppendChild(root);

        void AddChild(string name, byte[]? value)
        {
            if (value.NotNullOrEmpty())
            {
                var elem = doc.CreateElement(name);
                elem.InnerText = value.Base64Encode();
                root.AppendChild(elem);
            }
        }

        AddChild("Modulus", p.Modulus);
        AddChild("Exponent", p.Exponent);
        if (includePrivate)
        {
            AddChild("D", p.D);
            AddChild("P", p.P);
            AddChild("Q", p.Q);
            AddChild("DP", p.DP);
            AddChild("DQ", p.DQ);
            AddChild("InverseQ", p.InverseQ);
        }

        using var stringWriter = new StringWriter();
        using var xmlWriter = XmlWriter.Create(stringWriter, new XmlWriterSettings
        {
            Indent = true,
            IndentChars = "  ",  // 两个空格缩进
            OmitXmlDeclaration = true  // 不输出 <?xml version="1.0"...>
        });
        doc.WriteTo(xmlWriter);
        xmlWriter.Flush();
        return stringWriter.ToString();
    }

    static RSAParameters XmlToRsaParameters(string xml)
    {
        var doc = new XmlDocument();
        doc.LoadXml(xml);
        var root = doc.SelectSingleNode("RSAKeyValue") ?? throw new ArgumentException("Invalid RSA key XML: missing RSAKeyValue element");

        byte[]? GetChildValue(string name)
        {
            var node = root.SelectSingleNode(name);
            if (node != null && node.InnerText.NotNullOrWhiteSpace()) return node.InnerText.Base64Decode();
            return null;
        }

        var p = new RSAParameters
        {
            Modulus = GetChildValue("Modulus"),
            Exponent = GetChildValue("Exponent"),
            D = GetChildValue("D"),
            P = GetChildValue("P"),
            Q = GetChildValue("Q"),
            DP = GetChildValue("DP"),
            DQ = GetChildValue("DQ"),
            InverseQ = GetChildValue("InverseQ")
        };

        // 基本验证：公钥必须有 Modulus 和 Exponent
        if (p.Modulus == null || p.Exponent == null) throw new ArgumentException("Invalid RSA public key: missing Modulus or Exponent");
        return p;
    }
}