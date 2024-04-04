using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog.Context;
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
    // Replace with the highlight endpoint. For highlight.io cloud, use https://otel.highlight.io:4318
    public static readonly String OtlpEndpoint = "http://localhost:4318";

    // Replace with your project ID and service name.
    public static readonly String ProjectId = "1";
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
        };

        var headerValue = Baggage.GetBaggage(HighlightHeader);
        if (headerValue == null) return ctx;

        var parts = headerValue.Split("/");
        if (parts.Length < 2) return ctx;

        ctx["highlight.session_id"] = parts[0];
        ctx["highlight.trace_id"] = parts[1];
        return ctx;
    }

    public static void EnrichWithHttpRequest(Activity activity, HttpRequest httpRequest)
    {
        var headerValues = httpRequest.Headers[HighlightHeader];
        if (headerValues.Count < 1) return;
        var headerValue = headerValues[0];
        if (headerValue == null) return;
        var parts = headerValue.Split("/");
        if (parts?.Length < 2) return;
        activity.SetTag("highlight.session_id", parts?[0]);
        activity.SetTag("highlight.trace_id", parts?[1]);
        Baggage.SetBaggage(new KeyValuePair<string, string>[]
        {
            new(HighlightHeader, headerValue)
        });
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
}