using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;

namespace highlight_dotnet;

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
    public const OtlpProtocol Protocol = OtlpProtocol.HttpProtobuf;
    public const OtlpExportProtocol ExportProtocol = OtlpExportProtocol.HttpProtobuf;
    public const String HighlightHeader = "x-highlight-request";
    
    public static string? OtlpEndpoint;
    public static string? ProjectId;
    public static string? ServiceName;
    public static string? TracesEndpoint;
    public static string? LogsEndpoint;
    public static string? MetricsEndpoint;

    public static Dictionary<string, object?>? ResourceAttributes;

    private static Random _random = new Random();

    public static Dictionary<string, string?> GetHighlightContext()
    {
        var ctx = new Dictionary<string, string?>
        {
            { "highlight.project_id", ProjectId },
            { "service.name", ServiceName },
        };

        var headerValue = Baggage.GetBaggage(HighlightHeader);
        if (headerValue == null) return ctx;

        string?[] parts = headerValue.Split("/");
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

        var (sessionId, requestId) = ExtractContext(httpRequest);
        activity.SetTag("highlight.session_id", sessionId);
        activity.SetTag("highlight.trace_id", requestId);
        Baggage.SetBaggage(new KeyValuePair<string, string>[]
        {
            new(HighlightHeader, $"{sessionId}/{requestId}")
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

    private static (string, string) ExtractContext(HttpRequest httpRequest)
    {
        var headerValues = httpRequest.Headers[HighlightHeader];
        if (headerValues is [not null, ..])
        {
            var parts = headerValues[0]?.Split("/");
            if (parts?.Length >= 2)
            {
                return (parts[0], parts[1]);
            }
        }

        var sessionId = httpRequest.Cookies["sessionID"] ?? new string(Enumerable
            .Repeat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 28)
            .Select(s => s[_random.Next(s.Length)]).ToArray());

        var sessionDataKey = $"sessionData_{sessionId}";
        var start = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var sessionData = httpRequest.Cookies[sessionDataKey] ??
                          $"{{\"sessionSecureID\":\"{sessionId}\",\"projectID\":\"{ProjectId}\",\"payloadID\":1,\"sessionStartTime\":{start},\"lastPushTime\":{start}}}";

        var opts = new CookieOptions
        {
            Expires = DateTimeOffset.Now.AddMinutes(15)
        };
        httpRequest.HttpContext.Response.Cookies.Append("sessionID", sessionId, opts);
        httpRequest.HttpContext.Response.Cookies.Append(sessionDataKey, sessionData, opts);
        return (sessionId, "");
    }
    
    public HighlightConfig(string? projectId, string? serviceName, string? otlpEndpoint = "https://otel.highlight.io:4318")
    {
        OtlpEndpoint = otlpEndpoint;
        ProjectId = projectId;
        ServiceName = serviceName;
        TracesEndpoint = OtlpEndpoint + "/v1/traces";
        LogsEndpoint = OtlpEndpoint + "/v1/logs";
        MetricsEndpoint = OtlpEndpoint + "/v1/metrics";
        ResourceAttributes = new Dictionary<string, object?>
        {
            ["highlight.project_id"] = ProjectId,
            ["service.name"] = ServiceName,
        };
    }

    public static void Configure(WebApplicationBuilder builder)
    {
        if (ResourceAttributes == null || LogsEndpoint == null || ServiceName == null || TracesEndpoint == null || MetricsEndpoint == null)
        {
            throw new Exception("HighlightConfig not initialized; please call HighlightConfig() first");
        }
        builder.Logging.AddOpenTelemetry(options =>
        {
            options
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddAttributes(ResourceAttributes!))
                .AddProcessor(new HighlightLogProcessor())
                .AddOtlpExporter(exporterOptions =>
                {
                    exporterOptions.Endpoint = new Uri(LogsEndpoint);
                    exporterOptions.Protocol = ExportProtocol;
                });
        });

        builder.Services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddAttributes(ResourceAttributes!))
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
}