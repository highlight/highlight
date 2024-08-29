# highlight-io .NET Core SDK

This directory contains the source code for the Highlight .NET Core SDK.

## Usage

1. Install the NuGet Package
2. Set up the Highlight SDK with your ASP app.
```csharp
HighlightConfig.Configure(builder);
var app = builder.Build();
```
3. Configure Serilog logging to export to highlight
```csharp
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
```