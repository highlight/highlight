import type { QuickStartContent } from '../../QuickstartContent'

export const svelteKitServerHook = `import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { H } from '@highlight-run/node';
import { SpanStatusCode } from '@opentelemetry/api';
import type { Handle, HandleServerError } from '@sveltejs/kit';

if (!building) {
    const projectID = env.HIGHLIGHT_PROJECT_ID;
    if (!projectID) {
        throw new Error('Set HIGHLIGHT_PROJECT_ID before starting the server');
    }

    H.init({
        projectID,
        serviceName: 'sveltekit-server',
        environment: dev ? 'development' : 'production',
        // Optional: a self-hosted Highlight / OTLP collector base URL.
        otlpEndpoint: env.HIGHLIGHT_OTLP_ENDPOINT,
    });
}

export const handle: Handle = ({ event, resolve }) => {
    if (building) return resolve(event);

    const route = event.route.id ?? 'unmatched';
    return H.runWithHeaders(
        event.request.method + ' ' + route,
        Object.fromEntries(event.request.headers),
        async (span) => {
            const response = await resolve(event);
            span.setAttribute('http.response.status_code', response.status);
            if (response.status >= 500) {
                span.setStatus({ code: SpanStatusCode.ERROR });
            }
            return response;
        },
        {
            attributes: {
                'http.request.method': event.request.method,
                'http.route': route,
            },
        },
    );
};

export const handleError: HandleServerError = ({ error, event, status, message }) => {
    if (!building) {
        const { secureSessionId, requestId } = H.parseHeaders(event.request.headers);
        // Use a child span: consumeError ends the span it reports on.
        // Empty headers retain the active request span as the parent.
        const { span } = H.startWithHeaders('sveltekit.error', {});
        span.setStatus({ code: SpanStatusCode.ERROR });
        H.consumeError(
            error instanceof Error ? error : new Error(String(error)),
            secureSessionId,
            requestId,
            {
                'http.request.method': event.request.method,
                'http.route': event.route.id ?? 'unmatched',
                'http.response.status_code': status,
            },
            { span },
        );
    }

    // Preserve SvelteKit's safe response message, not the original exception.
    return { message };
};`

export const svelteKitVerificationRoute = `import { H } from '@highlight-run/node';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ request, url }) => {
    const { secureSessionId, requestId } = H.parseHeaders(request.headers);
    H.log('SvelteKit backend verification', 'info', secureSessionId, requestId);

    if (url.searchParams.has('error')) {
        throw new Error('SvelteKit backend test error');
    }

    return json({ ok: true });
};`

export const JSSvelteKitReorganizedContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Record server errors, logs, and request traces in a SvelteKit Node application.',
	logoKey: 'sveltekit',
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		{
			title: 'Use a Node-compatible deployment.',
			content:
				'This guide uses `@highlight-run/node` with a SvelteKit Node server, such as a deployment using [adapter-node](https://svelte.dev/docs/kit/adapter-node). ' +
				'Keep the SDK in server-only files. It does not run in Cloudflare Workers or other edge runtimes, and a static-only deployment has no server hooks to instrument.',
		},
		{
			title: 'Install the server SDK.',
			content:
				'Install the Highlight Node SDK and the OpenTelemetry API used for span status codes.',
			code: [
				{
					key: 'npm',
					text: 'npm install @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
				{
					key: 'yarn',
					text: 'yarn add @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: 'pnpm add @highlight-run/node @opentelemetry/api',
					language: 'bash',
				},
			],
		},
		{
			title: 'Set your project ID on the server.',
			content:
				'Get your project ID from [the Highlight setup page](https://app.highlight.io/setup). ' +
				'For local development, add it to `.env`; in production, set it in your server environment. ' +
				'`adapter-node` does not load `.env` files automatically in production. ' +
				'Leave `HIGHLIGHT_OTLP_ENDPOINT` unset for hosted Highlight. For a self-hosted collector, it is an optional base URL without a trailing slash or `/v1/traces` suffix.',
			code: [
				{
					key: 'environment',
					text: 'HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>',
					language: 'bash',
				},
			],
		},
		{
			title: 'Add the server hooks.',
			content:
				"Create `src/hooks.server.ts` with the complete example below. If you already have hooks, integrate the wrapper with your existing `handle` (using SvelteKit's [sequence helper](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) when needed) and merge the error reporting into your existing `handleError`. " +
				'The plain header copy lets the SDK propagate trace and session context without modifying the request. ' +
				'`resolve()` returns an HTTP response even for route errors, so the request span records its status explicitly. ' +
				'Unexpected endpoint, server-load, and rendering errors reach `handleError`; expected `error(...)` responses do not. ' +
				'The separate error span prevents `consumeError()` from ending the request span before its response status is recorded. ' +
				'The `building` guard skips telemetry initialization and capture during prerendering.',
			code: [
				{
					key: 'server-hooks',
					text: svelteKitServerHook,
					language: 'ts',
				},
			],
		},
		{
			title: 'Connect browser sessions. (optional)',
			content:
				'Follow the [SvelteKit browser quickstart](/docs/getting-started/browser/sveltekit) to initialize `highlight.run` in `src/hooks.client.ts` using the same project ID. ' +
				'Configure `tracingOrigins` for your backend origin so browser fetch/XHR requests include `x-highlight-request`. ' +
				'The server reads that header to associate spans and errors with a session. A direct page load or `curl` request without it still produces backend telemetry, but has no browser session to attach. ' +
				'Console logs are captured with their active trace context by default. To explicitly associate a log with the incoming session, use `H.parseHeaders()` and pass its values to `H.log()` as in the verification route below.',
		},
		{
			title: 'Verify a request, log, and unexpected error.',
			content:
				'In a development app, add `src/routes/highlight-test/+server.ts` with this temporary endpoint. ' +
				'Request `/highlight-test` to receive `{ "ok": true }`, then `/highlight-test?error=1` to trigger a 500 response with SvelteKit\'s safe error message. ' +
				'In Highlight, filter by the `sveltekit-server` service: check the request traces and response status, the `SvelteKit backend verification` log, and the `SvelteKit backend test error` exception. ' +
				'Use a fetch from your instrumented browser to check session association as well. Allow a few seconds for batching, and remove the test endpoint before deploying your app.',
			code: [
				{
					key: 'verification-route',
					text: svelteKitVerificationRoute,
					language: 'ts',
				},
			],
		},
		{
			title: 'Check runtime and initialization limits.',
			content:
				"This hook creates explicit request and error spans. Instrumenting libraries that load before the hooks requires earlier SDK initialization; consult [SvelteKit observability](https://svelte.dev/docs/kit/observability) and your adapter's support before enabling its experimental instrumentation entrypoint. " +
				'Do not register a second OpenTelemetry NodeSDK alongside Highlight. Keep `@highlight-run/node` external in Vite SSR rather than adding it to `ssr.noExternal`, and restart the server after instrumentation changes. ' +
				'If telemetry is missing, check the server project ID, runtime, collector reachability, and service/environment filters. If only session links are missing, inspect `x-highlight-request` on an instrumented browser fetch.',
		},
	],
}
