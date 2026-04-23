using SharpDevLib;
using System.Security.Cryptography;
using System.Text;

namespace ToolBox.Services;

/// <summary>
/// 对称加密帮助类（AES、DES、3DES）
/// </summary>
public static class SymmetricCryptoHelper
{
    #region AES加解密

    /// <summary>
    /// AES加密字节数组
    /// </summary>
    /// <param name="data">要加密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>加密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] AesEncrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var aes = Aes.Create();
        aes.SetKeyAutoPad(key);
        aes.Mode = mode;
        aes.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            aes.SetIVAutoPad(iv);
        }
        else if (mode != CipherMode.ECB)
        {
            // 对于非ECB模式，如果没有提供IV，则生成随机IV
            aes.GenerateIV();
        }

        return aes.Encrypt(data);
    }

    /// <summary>
    /// AES解密字节数组
    /// </summary>
    /// <param name="data">要解密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>解密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] AesDecrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var aes = Aes.Create();
        aes.SetKeyAutoPad(key);
        aes.Mode = mode;
        aes.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            aes.SetIVAutoPad(iv);
        }

        return aes.Decrypt(data);
    }

    /// <summary>
    /// AES加密字符串（UTF8编码，Base64输出）
    /// </summary>
    /// <param name="plaintext">要加密的字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>Base64编码的加密数据</returns>
    public static string AesEncrypt(string plaintext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Encoding.UTF8.GetBytes(plaintext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var encrypted = AesEncrypt(data, keyBytes, mode, padding, ivBytes);
        return Convert.ToBase64String(encrypted);
    }

    /// <summary>
    /// AES解密字符串（Base64解码，UTF8输出）
    /// </summary>
    /// <param name="ciphertext">Base64编码的加密字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>解密后的字符串</returns>
    public static string AesDecrypt(string ciphertext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Convert.FromBase64String(ciphertext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var decrypted = AesDecrypt(data, keyBytes, mode, padding, ivBytes);
        return Encoding.UTF8.GetString(decrypted);
    }

    #endregion

    #region DES加解密

    /// <summary>
    /// DES加密字节数组
    /// </summary>
    /// <param name="data">要加密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>加密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] DesEncrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var des = DES.Create();
        des.SetKeyAutoPad(key);
        des.Mode = mode;
        des.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            des.SetIVAutoPad(iv);
        }
        else if (mode != CipherMode.ECB)
        {
            des.GenerateIV();
        }

        return des.Encrypt(data);
    }

    /// <summary>
    /// DES解密字节数组
    /// </summary>
    /// <param name="data">要解密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>解密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] DesDecrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var des = DES.Create();
        des.SetKeyAutoPad(key);
        des.Mode = mode;
        des.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            des.SetIVAutoPad(iv);
        }

        return des.Decrypt(data);
    }

    /// <summary>
    /// DES加密字符串（UTF8编码，Base64输出）
    /// </summary>
    /// <param name="plaintext">要加密的字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>Base64编码的加密数据</returns>
    public static string DesEncrypt(string plaintext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Encoding.UTF8.GetBytes(plaintext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var encrypted = DesEncrypt(data, keyBytes, mode, padding, ivBytes);
        return Convert.ToBase64String(encrypted);
    }

    /// <summary>
    /// DES解密字符串（Base64解码，UTF8输出）
    /// </summary>
    /// <param name="ciphertext">Base64编码的加密字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>解密后的字符串</returns>
    public static string DesDecrypt(string ciphertext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Convert.FromBase64String(ciphertext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var decrypted = DesDecrypt(data, keyBytes, mode, padding, ivBytes);
        return Encoding.UTF8.GetString(decrypted);
    }

    #endregion

    #region 3DES加解密

    /// <summary>
    /// 3DES（TripleDES）加密字节数组
    /// </summary>
    /// <param name="data">要加密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>加密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] TripleDesEncrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var tripleDes = TripleDES.Create();
        tripleDes.SetKeyAutoPad(key);
        tripleDes.Mode = mode;
        tripleDes.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            tripleDes.SetIVAutoPad(iv);
        }
        else if (mode != CipherMode.ECB)
        {
            tripleDes.GenerateIV();
        }

        return tripleDes.Encrypt(data);
    }

    /// <summary>
    /// 3DES（TripleDES）解密字节数组
    /// </summary>
    /// <param name="data">要解密的数据</param>
    /// <param name="key">密钥</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量（当模式不是ECB时必须提供）</param>
    /// <returns>解密后的数据</returns>
    /// <exception cref="ArgumentNullException">当data或key为空时引发</exception>
    /// <exception cref="ArgumentException">当模式不是ECB且iv为空时引发</exception>
    public static byte[] TripleDesDecrypt(byte[] data, byte[] key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, byte[]? iv = null)
    {
        if (data == null || data.Length == 0) throw new ArgumentNullException(nameof(data));
        if (key == null || key.Length == 0) throw new ArgumentNullException(nameof(key));

        if (mode != CipherMode.ECB && (iv == null || iv.Length == 0))
        {
            throw new ArgumentException("当加密模式不是ECB时，必须提供初始化向量(iv)");
        }

        using var tripleDes = TripleDES.Create();
        tripleDes.SetKeyAutoPad(key);
        tripleDes.Mode = mode;
        tripleDes.Padding = padding;

        if (iv != null && iv.Length > 0)
        {
            tripleDes.SetIVAutoPad(iv);
        }

        return tripleDes.Decrypt(data);
    }

    /// <summary>
    /// 3DES（TripleDES）加密字符串（UTF8编码，Base64输出）
    /// </summary>
    /// <param name="plaintext">要加密的字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>Base64编码的加密数据</returns>
    public static string TripleDesEncrypt(string plaintext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Encoding.UTF8.GetBytes(plaintext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var encrypted = TripleDesEncrypt(data, keyBytes, mode, padding, ivBytes);
        return Convert.ToBase64String(encrypted);
    }

    /// <summary>
    /// 3DES（TripleDES）解密字符串（Base64解码，UTF8输出）
    /// </summary>
    /// <param name="ciphertext">Base64编码的加密字符串</param>
    /// <param name="key">密钥字符串（将转换为UTF8字节数组）</param>
    /// <param name="mode">加密模式</param>
    /// <param name="padding">填充模式</param>
    /// <param name="iv">初始化向量字符串（将转换为UTF8字节数组，当模式不是ECB时必须提供）</param>
    /// <returns>解密后的字符串</returns>
    public static string TripleDesDecrypt(string ciphertext, string key, CipherMode mode = CipherMode.CBC, PaddingMode padding = PaddingMode.PKCS7, string? iv = null)
    {
        var data = Convert.FromBase64String(ciphertext);
        var keyBytes = Encoding.UTF8.GetBytes(key);
        byte[]? ivBytes = iv != null ? Encoding.UTF8.GetBytes(iv) : null;

        var decrypted = TripleDesDecrypt(data, keyBytes, mode, padding, ivBytes);
        return Encoding.UTF8.GetString(decrypted);
    }

    #endregion

    /// <summary>
    /// 创建加密模式
    /// </summary>
    /// <param name="mode">加密模式字符串</param>
    /// <returns>加密模式枚举</returns>
    public static CipherMode CreateCipherMode(string mode)
    {
        return mode.ToUpper() switch
        {
            "ECB" => CipherMode.ECB,
            "CBC" => CipherMode.CBC,
            "CFB" => CipherMode.CFB,
            "OFB" => CipherMode.OFB,
            "CTS" => CipherMode.CTS,
            _ => throw new NotSupportedException($"不支持的加密模式: {mode}")
        };
    }

    /// <summary>
    /// 创建填充模式
    /// </summary>
    /// <param name="padding">填充模式字符串</param>
    /// <returns>填充模式枚举</returns>
    public static PaddingMode CreatePaddingMode(string padding)
    {
        return padding.ToUpper() switch
        {
            "NONE" => PaddingMode.None,
            "PKCS7" => PaddingMode.PKCS7,
            "ZEROS" => PaddingMode.Zeros,
            "ANSIX923" => PaddingMode.ANSIX923,
            "ISO10126" => PaddingMode.ISO10126,
            _ => throw new NotSupportedException($"不支持的填充模式: {padding}")
        };
    }
}