# highlight-io .NET Core SDK

This directory contains the source code for the Highlight .NET Core SDK.

## Usage

1. Install the NuGet Package
2. Set up the Highlight SDK with your ASP app.
```csharp
using System.Diagnostics;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
// configure your web application

// Initialize trace, error, metric, and log export
builder.Services
    .AddHighlightInstrumentation(options => options.ProjectId = "<YOUR_PROJECT_ID>");
builder.Logging
    .AddHighlightInstrumentation(options => options.ProjectId = "<YOUR_PROJECT_ID>");

var app = builder.Build();
```
3. Configure Serilog logging to export to highlight
```csharp
Log.Logger = new LoggerConfiguration()
    .Enrich.WithMachineName()
    .Enrich.WithHighlight()
    .Enrich.FromLogContext()
    .WriteTo.Async(async =>
        async.HighlightOpenTelemetry(options =>
        {
            options.ProjectId = "<YOUR_PROJECT_ID>";
            options.ServiceName = "<YOUR_SERVICE_NAME>";
        })
    )
    .CreateLogger();
```
