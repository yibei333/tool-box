using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SharpDevLib;

namespace ToolBox.Filters;

public class ExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger<Program>().LogError(context.Exception, "处理请求失败:{Message},{Trace}", context.Exception?.Message, context.Exception?.StackTrace);
        context.HttpContext.Response.StatusCode = 500;
        context.Result = new JsonResult(EmptyReply.Failed(context.Exception?.InnerException?.Message ?? context.Exception?.Message));
    }
}
