using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace cs
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            Highlight.OpenTelemetry.Register(options => {
                options.ProjectId = "1";
                options.ServiceName = "example-dotnet-backend";
                options.OtlpEndpoint = "http://localhost:4318";
            });
        }
        
        protected void Application_End()
        {
            Highlight.OpenTelemetry.Unregister();
        }
    }
}