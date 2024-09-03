namespace Highlight.Example
{
using System.Diagnostics;
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
            
            var tracer = new ActivitySource(Highlight.OpenTelemetry.GetConfig().ServiceName);
            var activityListener = new ActivityListener
            {
                ShouldListenTo = s => true,
                SampleUsingParentId = (ref ActivityCreationOptions<string> activityOptions) => ActivitySamplingResult.AllData,
                Sample = (ref ActivityCreationOptions<ActivityContext> activityOptions) => ActivitySamplingResult.AllData
            };
            ActivitySource.AddActivityListener(activityListener);
        
            Log.Information("hello, world");
            var span = tracer.StartActivity("my span");
            if (span == null) return;

            span.SetTag("mystring", "value");
            span.SetStatus(ActivityStatusCode.Ok);
            span.Stop();
        }
        
        protected void Application_End()
        {
            Highlight.OpenTelemetry.Unregister();
        }
    }
}