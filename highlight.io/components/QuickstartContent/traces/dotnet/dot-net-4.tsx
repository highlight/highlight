import { siteUrl } from '../../../../utils/urls'
import { verifyErrors } from '../../backend/shared-snippets'
import { verifyLogs } from '../../logging/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'
import { downloadSnippet, setupFrontendSnippet } from './shared-snippets'

export const DotNet4OTLPTracingContent: QuickStartContent = {
	title: 'Error Monitoring / Logging / Tracing in .NET 4.x via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Error Monitoring / Logging / Tracing in .NET 4.x via the OpenTelemetry Protocol (OTLP).`,
	entries: [
		downloadSnippet('ASP4'),
		{
			title: 'Set up your highlight.io browser SDK.',
			content: `The installation differs from the normal [frontend getting started guide](${siteUrl(
				'/docs/getting-started/frontend/other',
			)}) in the configuration of the .NET trace propagation. 
			The TraceParentContext value is set based on the server trace context so that
			client side tracing can carry the existing trace ID and session context.
			Update your \`Views/Shared/_Layout.cshtml\` HTML template entrypoint based on the following:`,
			code: [
				{
					text: `@using OpenTelemetry.Trace
@functions {
    // set the \`traceparent\` meta tag to the current active span to propagate context to the client
    string GetTraceParentContext()
    {
        var currentTrace = Tracer.CurrentSpan;
        if (!currentTrace.IsRecording)
        {
            return "00-00-00-00";
        }
        
        var traceId = currentTrace.Context.TraceId;
        var spanId = currentTrace.Context.SpanId;

        return $"00-{traceId.ToHexString()}-{spanId.ToHexString()}-01";
    }
}
<!DOCTYPE html>
<html>
<head>
    <meta name="traceparent" content="@GetTraceParentContext()">
    ${setupFrontendSnippet}
    @* your standard head contents here... *@
</head>
<body>
	@* your standard body contents here... *@
	@RenderSection("scripts", required: false)
</body>
</html>`,
					language: 'html',
				},
			],
		},
		{
			title: '.NET supports OpenTelemetry instrumentation out of the box.',
			content:
				'The Highlight.ASP4 NuGet package sets up OpenTelemetry instrumentation and export for highlight, injecting configuration functions for your ASPCore app to simplify instrumentation.',
		},
		{
			title: 'Bootstrap Highlight with your ASP 4 application MVC entrypoint.',
			content:
				'Update your `Global.asax.cs` application entrypoint to initialize highlight.',
			code: [
				{
					text: `using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

public class MvcApplication : System.Web.HttpApplication
{
	protected void Application_Start()
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
		var logger = new LoggerConfiguration()
			.Enrich.WithHighlight()
			.WriteTo.HighlightOpenTelemetry(options =>
			{
				options.ProjectId = "<YOUR_PROJECT_ID>";
				options.ServiceName = "example-dotnet-backend";
			})
			.CreateLogger();
		logger.Information("Hello, World!");
	}
	
	protected void Application_End()
	{
		Highlight.OpenTelemetry.Unregister();
	}
}`,
					language: 'csharp',
				},
			],
		},
		verifyErrors,
		verifyLogs,
		verifyTraces,
	],
}
