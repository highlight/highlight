using System.Diagnostics;
using Serilog;

namespace Highlight.Example;

public class Program
{
    static void Main()
    {
        var builder = WebApplication.CreateBuilder();

        // Add services to the container.
        // builder.Services
        //     .AddRazorComponents()
        //     .AddInteractiveServerComponents();
        builder.Services.AddHighlightInstrumentation(options => options.ProjectId = "1");
        builder.Logging
            .AddHighlightInstrumentation(options =>
            {
                options.ProjectId = "1";
                options.ServiceName = "example-dotnet-backend";
                options.OtlpEndpoint = "http://localhost:4318";
            });

        Log.Logger = new LoggerConfiguration()
            .Enrich.WithHighlight()
            .WriteTo.HighlightOpenTelemetry(options =>
            {
                options.ProjectId = "1";
                options.ServiceName = "example-dotnet-backend";
                options.OtlpEndpoint = "http://localhost:4318";
            })
            .CreateLogger();

        var app = builder.Build();
        
        var tracer = new ActivitySource(Highlight.OpenTelemetry.GetConfig().ServiceName);
        var activityListener = new ActivityListener
        {
            ShouldListenTo = s => true,
            SampleUsingParentId = (ref ActivityCreationOptions<string> activityOptions) => ActivitySamplingResult.AllData,
            Sample = (ref ActivityCreationOptions<ActivityContext> activityOptions) => ActivitySamplingResult.AllData
        };
        ActivitySource.AddActivityListener(activityListener);
        
        Log.Information("hello, world");
        using var span = tracer.StartActivity("my span")!;
        span.SetTag("mystring", "value");
        span.SetStatus(ActivityStatusCode.Ok);
    }
}