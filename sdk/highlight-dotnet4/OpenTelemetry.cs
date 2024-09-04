using System.Diagnostics;
using OpenTelemetry;
using OpenTelemetry.Exporter;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog.Configuration;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;
using System;

namespace Serilog
{

public static class HighlightSerilogExtensions
    {
        public static LoggerConfiguration HighlightOpenTelemetry(this LoggerSinkConfiguration loggerConfiguration,
            Action<Highlight.OpenTelemetry.Config> configure)
        {
            Highlight.OpenTelemetry.Config config = new Highlight.OpenTelemetry.Config();
            configure(config);
            return loggerConfiguration.OpenTelemetry(options =>
            {
                options.Protocol = Highlight.OpenTelemetry.Protocol;
                options.Endpoint = config.OtlpEndpoint + "/v1/logs";
                options.ResourceAttributes = Highlight.OpenTelemetry.GetResourceAttributes();
            });
        }

        public static LoggerConfiguration WithHighlight(this LoggerEnrichmentConfiguration loggerConfiguration)
        {
            return loggerConfiguration.With(new Highlight.LogEnricher());
        }
    }
}

namespace Highlight
{
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Extensions.Logging;

public class TraceProcessor : BaseProcessor<Activity>
    {
        public override void OnStart(Activity data)
        {
            var ctx = OpenTelemetry.GetHighlightContext();
            foreach (var entry in ctx)
            {
                data.SetTag(entry.Key, entry.Value);
            }

            base.OnStart(data);
        }
    }

    public class LogProcessor : BaseProcessor<LogRecord>
    {
        public override void OnStart(LogRecord data)
        {
            var ctx = OpenTelemetry.GetHighlightContext();
            var attributes = ctx.Select(entry => new KeyValuePair<string, object>(entry.Key, entry.Value)).ToList();
            if (data.Attributes != null)
            {
                attributes = attributes.Concat(data.Attributes).ToList();
            }

            data.Attributes = attributes;
            base.OnStart(data);
        }
    }

    public class LogEnricher : ILogEventEnricher
    {
        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory pf)
        {
            var ctx = OpenTelemetry.GetHighlightContext();
            foreach (var entry in ctx)
            {
                logEvent.AddOrUpdateProperty(pf.CreateProperty(entry.Key, entry.Value));
            }
        }
    }


    public static class OpenTelemetry
    {
        public const OtlpProtocol Protocol = OtlpProtocol.HttpProtobuf;
        public const OtlpExportProtocol ExportProtocol = OtlpExportProtocol.HttpProtobuf;
        public const OtlpProtocol SerilogExportProtocol = OtlpProtocol.HttpProtobuf;
        public const string HighlightHeader = "x-highlight-request";

        public class Config {
            public string ProjectId;
            public string ServiceName;
            public string OtlpEndpoint = "https://otel.highlight.io:4318";
        }
        
        public static Dictionary<string, object> GetResourceAttributes()
        {
            return new Dictionary<string, object>
            {
                ["highlight.project_id"] = Cfg.ProjectId,
                ["service.name"] = Cfg.ServiceName,
                ["telemetry.distro.name"] = "Highlight.ASP4",
                ["telemetry.distro.version"] = "0.1.7",
            };
        }

        static readonly Config Cfg = new Config();
        static readonly Random Random = new Random();
        
        static TracerProvider _tracerProvider;
        static MeterProvider _meterProvider;

        public static Dictionary<string, string> GetHighlightContext()
        {
            var ctx = new Dictionary<string, string>
            {
                { "highlight.project_id", Cfg.ProjectId },
                { "service.name", Cfg.ServiceName },
            };

            var headerValue = Baggage.GetBaggage(HighlightHeader);
            if (headerValue == null) return ctx;

            string[] parts = headerValue.Split('/');
            if (parts.Length < 2) return ctx;

            ctx["highlight.session_id"] = parts[0];
            ctx["highlight.trace_id"] = parts[1];
            return ctx;
        }

        public static Config GetConfig()
        {
            return Cfg;
        }

        static void EnrichWithHttpRequest(Activity activity, HttpRequest httpRequest)
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
            
            var (sessionId, requestId) = ExtractContext(httpRequest);
            activity.SetTag("highlight.session_id", sessionId);
            activity.SetTag("highlight.trace_id", requestId);
            Baggage.SetBaggage(new[] { new KeyValuePair<string, string>(HighlightHeader, $"{sessionId}/{requestId}") });
        }

        static void EnrichWithHttpResponse(Activity activity, HttpResponse httpResponse)
        {
            activity.SetTag("http.status_code", httpResponse.StatusCode);
            
            foreach(string header in httpResponse.Headers)
            {
                var value = httpResponse.Headers[header];
                activity.SetTag($"http.request.header.{header}", value);
            }
        }

        static (string, string) ExtractContext(HttpRequest httpRequest)
        {
            var headerValue = httpRequest.Headers[HighlightHeader];
            if (headerValue?.Length > 0)
            {
                var parts = headerValue.Split('/');
                if (parts.Length >= 2)
                {
                    return (parts[0], parts[1]);
                }
            }

            var sessionId = httpRequest.Cookies["sessionID"]?.Value ?? new string(Enumerable
                .Repeat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 28).Select(s => s[Random.Next(s.Length)]).ToArray());

            var sessionDataKey = $"sessionData_{sessionId}";
            var start = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var sessionData = httpRequest.Cookies[sessionDataKey]?.Value ?? $"{{\"sessionSecureID\":\"{sessionId}\",\"projectID\":\"{Cfg.ProjectId}\",\"payloadID\":1,\"sessionStartTime\":{start},\"lastPushTime\":{start}}}";

            httpRequest.RequestContext.HttpContext.Response.SetCookie(new HttpCookie("sessionID", sessionId)
            {
                Expires = DateTimeOffset.Now.AddMinutes(15).DateTime
            });
            httpRequest.RequestContext.HttpContext.Response.SetCookie(new HttpCookie(sessionDataKey, sessionData)
            {
                Expires = DateTimeOffset.Now.AddMinutes(15).DateTime
            });
            return (sessionId, "");
        }

        public static void Register(Action<Config> configure)
        {
            configure(Cfg);
            _tracerProvider = Sdk.CreateTracerProviderBuilder()
                .SetResourceBuilder(ResourceBuilder.CreateDefault().AddAttributes(GetResourceAttributes()))
                .AddHttpClientInstrumentation()
                .AddGrpcClientInstrumentation()
                .AddSqlClientInstrumentation()
                .AddQuartzInstrumentation()
                .AddWcfInstrumentation()
                .AddAspNetInstrumentation(options =>
                {
                    options.RecordException = true;
                    options.EnrichWithHttpRequest = EnrichWithHttpRequest;
                    options.EnrichWithHttpResponse = EnrichWithHttpResponse;
                })
                .AddSource(Cfg.ServiceName)
                .AddProcessor(new TraceProcessor())
                .AddOtlpExporter(exporterOptions =>
                {
                    exporterOptions.Endpoint = new Uri(Cfg.OtlpEndpoint + "/v1/traces");
                    exporterOptions.Protocol = ExportProtocol;
                })
                .Build();
            _meterProvider = Sdk.CreateMeterProviderBuilder()
                .AddMeter(Cfg.ServiceName)
                .AddHttpClientInstrumentation()
                .AddRuntimeInstrumentation()
                .AddProcessInstrumentation()
                .AddAspNetInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri(Cfg.OtlpEndpoint + "/v1/metrics");
                    options.Protocol = ExportProtocol;
                })
                .Build();
        }

        public static void InstrumentLogging(ILoggingBuilder logging, Action<Config> configure)
        {
            configure(Cfg);
            logging.AddOpenTelemetry(options =>
            {
                options
                    .SetResourceBuilder(ResourceBuilder.CreateDefault().AddAttributes(GetResourceAttributes()))
                    .AddProcessor(new LogProcessor())
                    .AddOtlpExporter(exporterOptions =>
                    {
                        exporterOptions.Endpoint = new Uri(Cfg.OtlpEndpoint + "/v1/logs");
                        exporterOptions.Protocol = ExportProtocol;
                    });
            });
        }

        public static void Unregister()
        {
            _tracerProvider.Dispose();
            _meterProvider.Dispose();
        }
    }
}
