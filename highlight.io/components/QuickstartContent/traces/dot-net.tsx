import { verifyErrors } from '../backend/shared-snippets'
import { verifyLogs } from '../logging/shared-snippets'
import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const DotNetOTLPTracingContent: QuickStartContent = {
	title: 'Error Monitoring / Logging / Tracing in .NET 6.x / 8.x via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Error Monitoring / Logging / Tracing in .NET 6.x / 8.x via the OpenTelemetry Protocol (OTLP).`,
	entries: [
		{
			title: '.NET supports OpenTelemetry instrumentation out of the box.',
			content:
				'Below, we explain how to define a `HighlightConfig` class which will setup opentelemetry export to highlight.',
		},
		{
			title: 'Install dependencies.',
			content:
				'Run the following in your .NET project to install dependencies.',
			code: [
				{
					text: `dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Sinks.Async
dotnet add package Serilog.Sinks.OpenTelemetry					
`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Define the Highlight configuration class.',
			content:
				'Copy the following code into a `HighlightConfig.cs` file in your project. ' +
				'Make sure to update the `ProjectId` and `ServiceName` values.',
			code: [
				{
					text: `using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;

namespace dotnet;

public class HighlightTraceProcessor : BaseProcessor<Activity>
{
    public override void OnStart(Activity data)
    {
        var ctx = HighlightConfig.GetHighlightContext();
        foreach (var entry in ctx)
        {
            data.SetTag(entry.Key, entry.Value);
        }

        base.OnStart(data);
    }
}

public class HighlightLogProcessor : BaseProcessor<LogRecord>
{
    public override void OnStart(LogRecord data)
    {
        var ctx = HighlightConfig.GetHighlightContext();
        var attributes = ctx.Select(entry => new KeyValuePair<string, object?>(entry.Key, entry.Value)).ToList();
        if (data.Attributes != null)
        {
            attributes = attributes.Concat(data.Attributes).ToList();
        }

        data.Attributes = attributes;
        base.OnStart(data);
    }
}

public class HighlightLogEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory pf)
    {
        var ctx = HighlightConfig.GetHighlightContext();
        foreach (var entry in ctx)
        {
            logEvent.AddOrUpdateProperty(pf.CreateProperty(entry.Key, entry.Value));
        }
    }
}

public class HighlightConfig
{
    // For highlight.io self-hosted, update to your collector endpoint
    private static readonly String OtlpEndpoint = "https://otel.highlight.io:4318";

    // Replace with your project ID and service name.
    public static readonly String ProjectId = "<YOUR_PROJECT_ID>";
    public static readonly String ServiceName = "highlight-dot-net-example";

    public static readonly String TracesEndpoint = OtlpEndpoint + "/v1/traces";
    public static readonly String LogsEndpoint = OtlpEndpoint + "/v1/logs";
    public static readonly String MetricsEndpoint = OtlpEndpoint + "/v1/metrics";

    public static readonly OtlpProtocol Protocol = OtlpProtocol.HttpProtobuf;
    public static readonly OtlpExportProtocol ExportProtocol = OtlpExportProtocol.HttpProtobuf;
    public static readonly String HighlightHeader = "x-highlight-request";

    public static readonly Dictionary<string, object> ResourceAttributes = new()
    {
        ["highlight.project_id"] = ProjectId,
        ["service.name"] = ServiceName,
    };

    public static Dictionary<string, string> GetHighlightContext()
    {
        var ctx = new Dictionary<string, string>
        {
            { "highlight.project_id", ProjectId },
            { "service.name", ServiceName },
        };

        var headerValue = Baggage.GetBaggage(HighlightHeader);
        if (headerValue == null) return ctx;

        var parts = headerValue.Split("/");
        if (parts.Length < 2) return ctx;

        ctx["highlight.session_id"] = parts[0];
        ctx["highlight.trace_id"] = parts[1];
        return ctx;
    }

    private static void EnrichWithHttpRequest(Activity activity, HttpRequest httpRequest)
    {
        activity.SetTag("http.client_ip", httpRequest.HttpContext.Connection.RemoteIpAddress?.ToString());
        activity.SetTag("http.flavor", httpRequest.HttpContext.Request.Protocol);
        activity.SetTag("http.host", httpRequest.Host);
        activity.SetTag("http.method", httpRequest.Method);
        activity.SetTag("http.request_content_length", httpRequest.ContentLength);
        activity.SetTag("http.route", httpRequest.RouteValues["action"]);
        activity.SetTag("http.scheme", httpRequest.Scheme);
        activity.SetTag("http.server_name", httpRequest.HttpContext.Request.Host.Host);
        activity.SetTag("http.url", httpRequest.Path);
        activity.SetTag("http.user_agent", httpRequest.Headers["User-Agent"]);
        
        for (var i = 0; i < httpRequest.Headers.Count; i++)
        {
            var header = httpRequest.Headers.ElementAt(i);
            activity.SetTag($"http.request.header.{header.Key}", header.Value);
        }
        
        var headerValues = httpRequest.Headers[HighlightHeader];
        if (headerValues.Count < 1) return;
        var headerValue = headerValues[0];
        if (headerValue == null) return;
        var parts = headerValue.Split("/");
        if (parts.Length < 2) return;
        activity.SetTag("highlight.session_id", parts?[0]);
        activity.SetTag("highlight.trace_id", parts?[1]);
        Baggage.SetBaggage(new KeyValuePair<string, string>[]
        {
            new(HighlightHeader, headerValue)
        });
    }

    private static void EnrichWithHttpResponse(Activity activity, HttpResponse httpResponse)
    {
        activity.SetTag("http.status_code", httpResponse.StatusCode);
        activity.SetTag("http.response_content_length", httpResponse.ContentLength);
        
        for (var i = 0; i < httpResponse.Headers.Count; i++)
        {
            var header = httpResponse.Headers.ElementAt(i);
            activity.SetTag($"http.response.header.{header.Key}", header.Value);
        }
    }

    public static void Configure(WebApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(options =>
        {
            options
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddAttributes(ResourceAttributes))
                .AddProcessor(new HighlightLogProcessor())
                .AddOtlpExporter(exporterOptions =>
                {
                    exporterOptions.Endpoint = new Uri(LogsEndpoint);
                    exporterOptions.Protocol = ExportProtocol;
                });
        });

        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddAttributes(ResourceAttributes))
            .WithTracing(tracing => tracing
                .AddSource(ServiceName)
                .AddProcessor(new HighlightTraceProcessor())
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.RecordException = true;
                    options.EnrichWithHttpRequest = EnrichWithHttpRequest;
                    options.EnrichWithHttpResponse = EnrichWithHttpResponse;
                })
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(TracesEndpoint);
                    options.Protocol = ExportProtocol;
                }))
            .WithMetrics(metrics => metrics
                .AddMeter(ServiceName)
                .AddAspNetCoreInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(MetricsEndpoint);
                    options.Protocol = ExportProtocol;
                }));
    }
}`,
					language: 'csharp',
				},
			],
		},
		{
			title: 'Bootstrap Highlight with your ASP application object.',
			content:
				'Update your `Program.cs` application entrypoint to initialize highlight.',
			code: [
				{
					text: `using System.Diagnostics;
using dotnet;
using OpenTelemetry.Trace;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
// configure your web application

// create a Serilog logger with Highlight export
Log.Logger = new LoggerConfiguration()
    .Enrich.WithMachineName()
    .Enrich.With<HighlightLogEnricher>()
    .Enrich.FromLogContext()
    .WriteTo.Async(async =>
        async.OpenTelemetry(options =>
        {
            options.Endpoint = HighlightConfig.LogsEndpoint;
            options.Protocol = HighlightConfig.Protocol;
            options.ResourceAttributes = HighlightConfig.ResourceAttributes;
        })
    )
    .CreateLogger();

// Initialize trace, error, and log export
HighlightConfig.Configure(builder);
var app = builder.Build();`,
					language: 'csharp',
				},
			],
		},
		verifyErrors,
		verifyLogs,
		verifyTraces,
	],
}
