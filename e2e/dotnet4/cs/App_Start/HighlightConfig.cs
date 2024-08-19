using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;
using System.Linq;

namespace cs
{

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
        // For highlight.io cloud, use https://otel.highlight.io:4318
        public static readonly String OtlpEndpoint = "http://localhost:4318";

        // Replace with your project ID and service name.
        public static readonly String ProjectId = "1";
        public static readonly String ServiceName = "highlight-dot-net-backend";

        public static readonly String TracesEndpoint = OtlpEndpoint + "/v1/traces";
        public static readonly String MetricsEndpoint = OtlpEndpoint + "/v1/metrics";
        public static readonly string LogsEndpoint = OtlpEndpoint + "/v1/logs";

        public static readonly OtlpExportProtocol ExportProtocol = OtlpExportProtocol.HttpProtobuf;
        public static readonly OtlpProtocol SerilogExportProtocol = OtlpProtocol.HttpProtobuf;
        public static readonly String HighlightHeader = "x-highlight-request";

        public static readonly Dictionary<string, object> ResourceAttributes = new Dictionary<string, object>
        {
            { "highlight.project_id", ProjectId },
            { "service.name", ServiceName },
        };
        
        private static Random _random = new Random();

        private static TracerProvider _tracerProvider;
        private static MeterProvider _meterProvider;
        private static Logger _loggerFactory;


        public static Dictionary<string, string> GetHighlightContext()
        {
            var ctx = new Dictionary<string, string>
            {
                { "highlight.project_id", ProjectId },
                { "service.name", ServiceName },
            };

            var headerValue = Baggage.GetBaggage(HighlightHeader);
            if (headerValue == null) return ctx;

            var parts = headerValue.Split('/');
            if (parts.Length < 2) return ctx;

            ctx["highlight.session_id"] = parts[0];
            ctx["highlight.trace_id"] = parts[1];
            return ctx;
        }

        private static void EnrichWithHttpRequest(Activity activity, HttpRequest httpRequest)
        {
            activity.SetTag("http.client_ip", httpRequest.UserHostAddress);
            activity.SetTag("http.flavor", httpRequest.Url.Scheme);
            activity.SetTag("http.host", httpRequest.UserHostName);
            activity.SetTag("http.method", httpRequest.HttpMethod);
            activity.SetTag("http.request_content_length", httpRequest.ContentLength);
            activity.SetTag("http.request_content_type", httpRequest.ContentType);
            activity.SetTag("http.request_query", httpRequest.Url.Query);
            activity.SetTag("http.route", httpRequest.RequestContext.RouteData.Route);
            activity.SetTag("http.scheme", httpRequest.Url.Scheme);
            activity.SetTag("http.url", httpRequest.Path);
            activity.SetTag("http.user_agent", httpRequest.Headers["User-Agent"]);
            
            foreach(string header in httpRequest.Headers)
            {
                var value = httpRequest.Headers[header];
                activity.SetTag($"http.request.header.{header}", value);
            }
            
            var (sessionID, requestID) = ExtractContext(httpRequest);
            activity.SetTag("highlight.session_id", sessionID);
            activity.SetTag("highlight.trace_id", requestID);
            Baggage.SetBaggage(new[] { new KeyValuePair<string, string>(HighlightHeader, $"{sessionID}/{requestID}") });
        }

        private static void EnrichWithHttpResponse(Activity activity, HttpResponse httpResponse)
        {
            activity.SetTag("http.status_code", httpResponse.StatusCode);
            
            foreach(string header in httpResponse.Headers)
            {
                var value = httpResponse.Headers[header];
                activity.SetTag($"http.request.header.{header}", value);
            }
        }
        private static (string, string) ExtractContext(HttpRequest httpRequest)
        {
            var headerValue = httpRequest.Headers[HighlightHeader];
            if (headerValue?.Length > 0)
            {
                var parts = headerValue.Split('/');
                if (parts?.Length >= 2)
                {
                    return (parts[0], parts[1]);
                }
            }

            var sessionID = httpRequest.Cookies["sessionID"]?.Value ?? new string(Enumerable
                .Repeat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 28).Select(s => s[_random.Next(s.Length)]).ToArray());

            var sessionDataKey = $"sessionData_{sessionID}";
            var start = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var sessionData = httpRequest.Cookies[sessionDataKey]?.Value ?? $"{{\"sessionSecureID\":\"{sessionID}\",\"projectID\":\"{ProjectId}\",\"payloadID\":1,\"sessionStartTime\":{start},\"lastPushTime\":{start}}}";

            httpRequest.RequestContext.HttpContext.Response.SetCookie(new HttpCookie("sessionID", sessionID)
            {
                Expires = DateTimeOffset.Now.AddMinutes(15).DateTime
            });
            httpRequest.RequestContext.HttpContext.Response.SetCookie(new HttpCookie(sessionDataKey, sessionData)
            {
                Expires = DateTimeOffset.Now.AddMinutes(15).DateTime
            });
            return (sessionID, "");
        }
        
        public static Logger getLogger()
        {
            return _loggerFactory;
        }

        public static void Register()
        {
            _tracerProvider = Sdk.CreateTracerProviderBuilder()
                 .SetResourceBuilder(ResourceBuilder.CreateDefault().AddAttributes(ResourceAttributes))
                 .AddAspNetInstrumentation(options =>
                 {
                     options.RecordException = true;
                     options.EnrichWithHttpRequest = EnrichWithHttpRequest;
                     options.EnrichWithHttpResponse = EnrichWithHttpResponse;
                 })
                 .AddSource(ServiceName)
                 .AddProcessor(new HighlightTraceProcessor())
                 .AddOtlpExporter(exporterOptions =>
                 {
                     exporterOptions.Endpoint = new Uri(TracesEndpoint);
                     exporterOptions.Protocol = ExportProtocol;
                 })
                 .Build();

            _meterProvider = Sdk.CreateMeterProviderBuilder()
                .AddMeter(ServiceName)
                .AddAspNetInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(MetricsEndpoint);
                    options.Protocol = ExportProtocol;
                })
                .Build();
            _loggerFactory = new LoggerConfiguration()
                .Enrich.WithThreadName()
                .Enrich.WithThreadId()
                .Enrich.With<HighlightLogEnricher>()
                .Enrich.FromLogContext()
                .WriteTo.OpenTelemetry(options =>
            {
                options.Endpoint = LogsEndpoint;
                options.Protocol = SerilogExportProtocol;
                options.IncludedData =
                    IncludedData.SpanIdField
                    | IncludedData.TraceIdField
                    | IncludedData.MessageTemplateTextAttribute;
                options.ResourceAttributes = new Dictionary<string, object>
                {
                    ["service.name"] = ServiceName,
                    ["highlight.project_id"] = ProjectId,
                    ["highlight.session_id"] = IncludedData.SpanIdField,
                    ["highlight.trace_id"] = IncludedData.TraceIdField
                };
                options.BatchingOptions.BatchSizeLimit = 700;
                options.BatchingOptions.BufferingTimeLimit = TimeSpan.FromSeconds(1);
                options.BatchingOptions.QueueLimit = 10;
            })
         .CreateLogger();
        }

        public static void Unregister()
        {
            _tracerProvider.Dispose();
            _meterProvider.Dispose();
            _loggerFactory.Dispose();
        }
    }
}