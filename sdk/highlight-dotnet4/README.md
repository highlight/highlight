# highlight-io .NET4 SDK

This directory contains the source code for the Highlight .NET4 SDK.

## Usage

1. Install the NuGet Package
2. Set up the Highlight SDK with your ASP app.
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

void Application_Start()
{
    AreaRegistration.RegisterAllAreas();
    FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
    RouteConfig.RegisterRoutes(RouteTable.Routes);
    BundleConfig.RegisterBundles(BundleTable.Bundles);
    
    
    Highlight.OpenTelemetry.Register(options =>
    {
        options.ProjectId = "<YOUR_PROJECT_ID>";
        options.ServiceName = "example-dotnet-backend";
    });
}
```
3. Configure Serilog logging to export to highlight
```csharp
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
