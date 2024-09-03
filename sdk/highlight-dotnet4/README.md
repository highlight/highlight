# highlight-io .NET4 SDK

This directory contains the source code for the Highlight .NET4 SDK.

## Usage

1. Install the NuGet Package
2. Set up the Highlight SDK with your ASP app.
```csharp
// initialize your webapp
AreaRegistration.RegisterAllAreas();
FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
RouteConfig.RegisterRoutes(RouteTable.Routes);
BundleConfig.RegisterBundles(BundleTable.Bundles);

// configure highlight
Highlight.OpenTelemetry.Register(options =>
{
    options.ProjectId = "<YOUR_PROJECT_ID>";
    options.ServiceName = "example-dotnet-backend";
});
```
3. Configure Serilog logging to export to highlight
```csharp
// create a Serilog logger with highlight export
var logger = new LoggerConfiguration()
    .Enrich.WithHighlight()
    .WriteTo.HighlightOpenTelemetry(options =>
    {
        options.ProjectId = "<YOUR_PROJECT_ID>";
        options.ServiceName = "example-dotnet-backend";
    })
    .CreateLogger();
logger.Information("Hello, World!");
```
