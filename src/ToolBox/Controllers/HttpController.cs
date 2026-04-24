using Microsoft.AspNetCore.Mvc;
using SharpDevLib;
using System.Net.Http.Headers;
using System.Text;

namespace ToolBox.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HttpController(IHttpClientFactory httpClientFactory) : ControllerBase
{
    [HttpPost("send")]
    [Consumes("application/json", "multipart/form-data", "application/x-www-form-urlencoded")]
    public async Task<HttpResponseResult> Send()
    {
        var method = Request.Headers["X-Http-Method"].FirstOrDefault() ?? "GET";
        var url = Request.Headers["X-Http-Url"].FirstOrDefault() ?? "";
        
        if (string.IsNullOrEmpty(url)) return new HttpResponseResult { StatusCode = 0, StatusText = "Error", Body = "URL is required" };

        var client = httpClientFactory.CreateClient();

        HttpRequestMessage? httpRequest = null;
        var contentType = Request.ContentType ?? "";

        if (contentType.StartsWith("multipart/form-data"))
        {
            // Handle multipart/form-data with file uploads
            var form = await Request.ReadFormAsync();
            var multipartContent = new MultipartFormDataContent();

            foreach (var file in form.Files)
            {
                var stream = file.OpenReadStream();
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
                multipartContent.Add(fileContent, file.Name, file.FileName);
            }

            // Handle text fields - IFormCollection uses string indexer for text fields
            foreach (var key in form.Keys)
            {
                if (!form.Files.Any(f => f.Name == key))
                {
                    var value = form[key].ToString();
                    multipartContent.Add(new StringContent(value ?? ""), key);
                }
            }

            httpRequest = new HttpRequestMessage(new HttpMethod(method), url);
            httpRequest.Content = multipartContent;

            // Add custom headers
            AddCustomHeaders(httpRequest, Request.Headers);
        }
        else if (contentType.StartsWith("application/x-www-form-urlencoded"))
        {
            // Handle application/x-www-form-urlencoded
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            httpRequest = new HttpRequestMessage(new HttpMethod(method), url);
            if (!string.IsNullOrEmpty(body))
            {
                var pairs = body.Split('&')
                    .Select(p => p.Split('=', 2))
                    .Where(p => p.Length == 2)
                    .ToDictionary(p => p[0], p => Uri.UnescapeDataString(p[1]));
                httpRequest.Content = new FormUrlEncodedContent(pairs);
            }

            AddCustomHeaders(httpRequest, Request.Headers);
        }
        else
        {
            // Handle JSON or other content types
            HttpSendRequest? request = null;
            if (Request.ContentLength > 0)
            {
                using var reader = new StreamReader(Request.Body);
                var json = await reader.ReadToEndAsync();
                request = System.Text.Json.JsonSerializer.Deserialize<HttpSendRequest>(json, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }

            request ??= new HttpSendRequest();
            method = request.Method;
            url = request.Url;

            httpRequest = new HttpRequestMessage(new HttpMethod(method), url);
            
            if (request.Headers != null)
            {
                foreach (var header in request.Headers)
                {
                    if (string.IsNullOrWhiteSpace(header.Key)) continue;
                    if (header.Key.Equals("Content-Type", StringComparison.OrdinalIgnoreCase)) continue;
                    try { httpRequest.Headers.TryAddWithoutValidation(header.Key, header.Value); } catch { }
                }
            }

            if (method != "GET" && method != "HEAD" && !string.IsNullOrEmpty(request.Body))
            {
                var ct = request.ContentType ?? "application/json";
                httpRequest.Content = new StringContent(request.Body, Encoding.UTF8, ct);
            }
        }

        return await SendRequest(client, httpRequest!);
    }

    private static void AddCustomHeaders(HttpRequestMessage request, IHeaderDictionary headers)
    {
        foreach (var header in headers)
        {
            var key = header.Key;
            if (key.Equals("X-Http-Method", StringComparison.OrdinalIgnoreCase) ||
                key.Equals("X-Http-Url", StringComparison.OrdinalIgnoreCase) ||
                key.Equals("Content-Type", StringComparison.OrdinalIgnoreCase) ||
                key.Equals("Host", StringComparison.OrdinalIgnoreCase)) continue;
            
            try
            {
                request.Headers.TryAddWithoutValidation(key, header.Value.ToString());
            }
            catch { }
        }
    }

    private async Task<HttpResponseResult> SendRequest(HttpClient client, HttpRequestMessage httpRequest)
    {
        var startTime = DateTime.Now;
        try
        {
            var response = await client.SendAsync(httpRequest);
            var duration = (int)(DateTime.Now - startTime).TotalMilliseconds;
            var responseBody = await response.Content.ReadAsStringAsync();

            var responseHeaders = new Dictionary<string, string>();
            foreach (var header in response.Headers)
                responseHeaders[header.Key] = string.Join(", ", header.Value);
            foreach (var header in response.Content.Headers)
                responseHeaders[header.Key] = string.Join(", ", header.Value);

            return new HttpResponseResult
            {
                StatusCode = (int)response.StatusCode,
                StatusText = response.ReasonPhrase ?? response.StatusCode.ToString(),
                Headers = responseHeaders,
                Body = responseBody,
                Duration = duration
            };
        }
        catch (TaskCanceledException)
        {
            return new HttpResponseResult { StatusCode = 0, StatusText = "Request Timeout", Headers = new(), Body = "The request timed out." };
        }
        catch (HttpRequestException ex)
        {
            return new HttpResponseResult { StatusCode = 0, StatusText = "Request Failed", Headers = new(), Body = ex.Message };
        }
    }
}

public class HttpSendRequest
{
    public string Method { get; set; } = "GET";
    public string Url { get; set; } = "";
    public Dictionary<string, string> Headers { get; set; } = new();
    public string? Body { get; set; }
    public string? ContentType { get; set; }
}

public class HttpResponseResult
{
    public int StatusCode { get; set; }
    public string StatusText { get; set; } = "";
    public Dictionary<string, string> Headers { get; set; } = new();
    public string Body { get; set; } = "";
    public int Duration { get; set; }
}
