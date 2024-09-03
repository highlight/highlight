namespace Highlight.Example
{
using Serilog;

public class Program : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            var logger = new LoggerConfiguration()
                .Enrich.WithHighlight()
                .WriteTo.HighlightOpenTelemetry(options =>
                {
                    options.ProjectId = "1";
                    options.ServiceName = "example-dotnet-backend";
                    options.OtlpEndpoint = "http://localhost:4318";
                })
                .CreateLogger();
            
            Highlight.OpenTelemetry.Register(options =>
            {
                options.ProjectId = "1";
                options.ServiceName = "example-dotnet-backend";
                options.OtlpEndpoint = "http://localhost:4318";
            });
            
            logger.Information("Hello, World!");
        }
        
        protected void Application_End()
        {
            Highlight.OpenTelemetry.Unregister();
        }
    }
}