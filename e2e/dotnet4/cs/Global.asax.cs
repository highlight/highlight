using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace cs {
using System.Diagnostics.Metrics;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Trace;

public class MvcApplication : System.Web.HttpApplication {
    public static ILogger Logger;
    public static Tracer Tracer;
    public static Meter Meter;

    public static Counter<long> RequestCounter;
    protected void Application_Start()
    {
        AreaRegistration.RegisterAllAreas();
        FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        RouteConfig.RegisterRoutes(RouteTable.Routes);
        BundleConfig.RegisterBundles(BundleTable.Bundles);
        Highlight.OpenTelemetry.Register(options => {
            options.ProjectId = "1";
            options.ServiceName = "example-dotnet-backend";
            options.OtlpEndpoint = "http://localhost:4317";
        });

        var loggerFactory = LoggerFactory.Create(builder => {
            builder.SetMinimumLevel(LogLevel.Debug);
            Highlight.OpenTelemetry.InstrumentLogging(builder,
            config => {
                config.ProjectId = "1";
                config.ServiceName = "example-dotnet-backend";
                config.OtlpEndpoint = "http://localhost:4317";
            });
        });
        Logger = loggerFactory.CreateLogger("example-dotnet-backend");

        var tracerProvider = Sdk.CreateTracerProviderBuilder()
            .AddSource("example-dotnet-backend")
            .Build();
        Tracer = tracerProvider.GetTracer("example-dotnet-backend");

        Meter = new Meter("example-dotnet-backend");
        RequestCounter = Meter.CreateCounter<long>("request.number.generated");
    }

    protected void Application_End()
    {
        Meter.Dispose();
        Highlight.OpenTelemetry.Unregister();
    }
}
}
