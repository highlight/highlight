import { siteUrl } from '../../../../utils/urls'
import { verifyErrors } from '../../backend/shared-snippets'
import { verifyLogs } from '../../logging/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'
import { downloadSnippet, setupFrontendSnippet } from './shared-snippets'

export const DotNetOTLPTracingContent: QuickStartContent = {
	title: 'Error Monitoring / Logging / Tracing in .NET 6.x / 8.x via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Error Monitoring / Logging / Tracing in .NET 6.x / 8.x via the OpenTelemetry Protocol (OTLP).`,
	entries: [
		downloadSnippet(),
		{
			title: 'Set up your highlight.io browser SDK.',
			content: `The installation differs from the normal [frontend getting started guide](${siteUrl(
				'/docs/getting-started/frontend/other',
			)}) in the configuration of the .NET trace propagation. 
			The _traceParentContext value is set based on the server trace context so that
			client side tracing can carry the existing trace ID and session context.
			Update your \`Components/App.razor\` HTML template entrypoint based on the following:`,
			code: [
				{
					text: `@using OpenTelemetry.Trace
<!DOCTYPE html>
<html lang="en">

<head>
    <meta name="traceparent" content="@_traceParentContext">
	${setupFrontendSnippet}
    @* your standard head contents here... *@
</head>

<body>
	@* your standard body contents here... *@
	<Routes/>
	<script src="_framework/blazor.web.js"></script>
</body>

</html>

@code
{
    private string? _traceParentContext;

    // set the \`traceparent\` meta tag to the current active span to propagate context to the client
    protected override void OnInitialized()
    {
        var currentTrace = Tracer.CurrentSpan;
        if (!currentTrace.IsRecording)
        {
            _traceParentContext = "00-00-00-00";
        }
        
        var traceId = currentTrace.Context.TraceId;
        var spanId = currentTrace.Context.SpanId;

        _traceParentContext = $"00-{traceId.ToHexString()}-{spanId.ToHexString()}-01";
    }
}`,
					language: 'html',
				},
			],
		},
		{
			title: '.NET supports OpenTelemetry instrumentation out of the box.',
			content:
				'The Highlight.ASPCore NuGet package sets up OpenTelemetry instrumentation and export for highlight, injecting configuration functions for your ASPCore app to simplify instrumentation.',
		},
		{
			title: 'Bootstrap Highlight with your ASP application object.',
			content:
				'Update your `Program.cs` application entrypoint to initialize highlight.',
			code: [
				{
					text: `using System.Diagnostics;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
// configure your web application

// create a Serilog logger with Highlight export
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

// Initialize trace, error, metric, and log export
builder.Services
    .AddHighlightInstrumentation(options => options.ProjectId = "<YOUR_PROJECT_ID>");
builder.Logging
    .AddHighlightInstrumentation(options => options.ProjectId = "<YOUR_PROJECT_ID>");

var app = builder.Build();`,
					language: 'csharp',
				},
			],
		},
		verifyErrors,
		verifyLogs,
		verifyTraces,
	],
}
