---
title: 'Application Tracing in .NET for Performance Monitoring'
createdAt: 2024-02-10T00:00:00.000Z
readingTime: 8
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: CTO @ Highlight
authorTwitter: ''
authorWebsite: ''
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2Fa-%2FAOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY%3Ds96-c&w=3840&q=75'
tags: '.NET, Logging, Development, Programming'
---

## Introduction
Application tracing is a critical aspect of software development and maintenance, especially in complex .NET environments. It involves monitoring and recording application activities, providing insights into application behavior and performance. This guide will delve into the essential tools and techniques for effective application tracing in .NET, ensuring that developers and administrators can efficiently troubleshoot and optimize their applications.

## The Role of Tracing in .NET Applications
In .NET, application tracing provides a window into the running state of applications, helping identify bottlenecks, errors, and performance issues. It's not only about finding problems; tracing also offers valuable data for optimizing and refining application functionality.

## Utilizing Built-in .NET Tracing Capabilities
.NET Framework and .NET Core offer built-in tracing capabilities that are robust and easy to implement. Let’s explore a basic example of how to implement tracing in a .NET application:

```java
using System.Diagnostics;

Trace.Listeners.Add(new TextWriterTraceListener("logfile.log"));
Trace.AutoFlush = true;
Trace.WriteLine("Starting application tracing");

// Your application logic here

Trace.WriteLine("Ending application tracing");
```
This code snippet demonstrates how to set up a simple trace listener that writes trace output to a file. This is fundamental for any .NET application requiring basic logging and tracing capabilities.

## Advanced Tracing with DiagnosticSource in .NET Core
For more advanced scenarios, especially in .NET Core, System.Diagnostics.DiagnosticSource provides a powerful way to collect rich telemetry data. Here's an example:

```java
using System.Diagnostics;

var source = new DiagnosticListener("MyApplicationSource");

if (source.IsEnabled("StartRequest"))
{
    source.Write("StartRequest", new { RequestId = Guid.NewGuid(), Timestamp = DateTime.UtcNow });
}

// Application logic here

if (source.IsEnabled("EndRequest"))
{
    source.Write("EndRequest", new { RequestId = Guid.NewGuid(), Timestamp = DateTime.UtcNow });
}
```
This code creates a DiagnosticListener that emits custom events, making it a versatile tool for complex tracing requirements.

## Leveraging Third-Party Tools for Tracing
### Application Insights for Comprehensive Telemetry
Application Insights, a feature of Azure Monitor, is an extensible Application Performance Management (APM) service for developers. It can be easily integrated into .NET applications:

```java
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;

var telemetryConfiguration = TelemetryConfiguration.CreateDefault();
telemetryConfiguration.InstrumentationKey = "your_instrumentation_key_here";
var telemetryClient = new TelemetryClient(telemetryConfiguration);

telemetryClient.TrackTrace("Application trace message");
```
This snippet shows how to send trace messages to Application Insights, which provides analytics and actionable insights on application performance and usage.

### Highlight.io for Open Source Telemetry via OpenTelemetry

Setting up OpenTelemetry tracing for a .NET application involves a few key steps. OpenTelemetry is a set of APIs, libraries, agents, and instrumentation that allow you to create and manage telemetry data (metrics, logs, and traces) for your applications. Here's how you can set up tracing in a .NET application:

1. Install Necessary NuGet Packages

First, you need to add the OpenTelemetry packages to your project. You can do this via the NuGet package manager. The primary package you'll need is OpenTelemetry. Depending on the specific needs of your application, you may also need exporters (like Zipkin, Jaeger, etc.) and instrumentation for specific libraries.

```bash
# Copy code
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Exporter.Console
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
```

2. Configure Services in Startup.cs

In the Startup.cs file of your .NET application, you need to configure the OpenTelemetry services. This includes setting up the tracing pipeline with any necessary exporters and instrumentations.

Here is an example code block for setting up a basic OpenTelemetry tracing with a console exporter and ASP.NET Core instrumentation:

```java
using OpenTelemetry.Trace;

public class Startup
{
public void ConfigureServices(IServiceCollection services)
{
// Other service configurations ...

        // Configure OpenTelemetry Tracing
        services.AddOpenTelemetryTracing(builder =>
        {
            builder
                .AddAspNetCoreInstrumentation()
                .AddConsoleExporter(); // Using console exporter for demonstration
        });
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        // Existing configuration code...

        // Ensure to use the appropriate middleware if needed
        app.UseOpenTelemetry();
    }
}
```

3. Instrumenting Your Code

To create custom traces or to add additional information to the automatic traces, you can use the OpenTelemetry API in your application code:

```java
using System.Diagnostics;
using OpenTelemetry.Trace;

public class MyService
{
private static readonly ActivitySource ActivitySource = new ActivitySource("highlight-dot-net-example");

    public void DoWork()
    {
        using (var activity = ActivitySource.StartActivity("DoingWork"))
        {
            // Your logic here
            // You can add custom tags or events to 'activity' as needed
        }
    }
}
```

The configuration and code above set up a basic tracing pipeline for a .NET application. This will set up a console exporter to debug traces to the console log, but you can change to an OTLP exporter to send traces to a remote collector.

4. Update the code block to send traces to highlight

```java
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
    public static readonly String OtlpEndpoint = "https://otel.highlight.io:4318";

    // Replace with your project ID and service name.
    public static readonly String ProjectId = "<YOUR_PROJECT_ID>";
    // This must match the ServiceName used by the ActivitySource to ensure traces are sent.
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
```

Get started today with our [OpenTelemetry instrumentation](https://opentelemetry.io/docs/languages/net/) for .NET that gives you flexibility with your data destination.

<BlogCallToAction/>

### NLog for Flexible and Structured Logging
NLog is a versatile logging tool for .NET, allowing for structured logging, which is crucial in modern application tracing. Here's a basic setup:

```java
var config = new NLog.Config.LoggingConfiguration();
var logfile = new NLog.Targets.FileTarget("logfile") { FileName = "file.txt" };
var logconsole = new NLog.Targets.ConsoleTarget("logconsole");

config.AddRule(LogLevel.Info, LogLevel.Fatal, logconsole);
config.AddRule(LogLevel.Debug, LogLevel.Fatal, logfile);

NLog.LogManager.Configuration = config;
```
This configuration sets up NLog to log messages to both a file and the console, providing a flexible approach to logging.

## Conclusion
Effective tracing in .NET applications is key to understanding and improving application behavior and performance. This guide has introduced various tools and techniques, from basic built-in .NET tracing to advanced tools like Application Insights and NLog. By choosing the right combination of these tools, developers can gain valuable insights and maintain robust, high-performance applications.

Explore these tracing techniques in your .NET projects. Share your experiences and insights in the comments below. For more in-depth information, check out our additional resources.
