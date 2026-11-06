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
				"Create `src/hooks.server.ts` with the example below. If you already have hooks, integrate the wrapper with your existing `handle` (using SvelteKit's [sequence helper](https://svelte.dev/docs/kit/@sveltejs-kit-hooks#sequence) when needed) and merge the error reporting into your existing `handleError`. " +
				'Converting `event.request.headers` with `Object.fromEntries(...)` lets the SDK propagate trace and session context into OpenTelemetry without mutating the request. ' +
				'`resolve()` returns an HTTP response even for route errors, so the request span records its status explicitly while unexpected endpoint, server-load, and rendering errors reach `handleError`. ' +
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
				'The server reads that header to associate spans and errors with a session.',
		},
		{
			title: 'Verify a request, log, and unexpected error.',
			content:
				'In a development app, add `src/routes/highlight-test/+server.ts` with this endpoint. ' +
				'Request `/highlight-test` to receive `{ "ok": true }`, then `/highlight-test?error=1` to trigger a 500 response. ' +
				'In Highlight, filter by the `sveltekit-server` service to verify the request trace, the `SvelteKit backend verification` log, and the `SvelteKit backend test error` exception.',
			code: [
				{
					key: 'verification-route',
					text: svelteKitVerificationRoute,
					language: 'ts',
				},
			],
		},
	],
}
