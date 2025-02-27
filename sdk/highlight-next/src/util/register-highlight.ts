import type { NodeOptions } from '@highlight-run/node'
import { OTLPHttpJsonTraceExporter, registerOTel } from '@vercel/otel'
import { isNodeJsRuntime } from './is-node-js-runtime'

export async function registerHighlight(nodeOptions: NodeOptions) {
	if (isNodeJsRuntime()) {
		const { H } = await import('@highlight-run/node')

		if (process.env.NEXT_OTEL_ENABLED !== 'false') {
			registerOTel({
				serviceName:
					nodeOptions.serviceName ?? process.env.OTEL_SERVICE_NAME,
				traceExporter: new OTLPHttpJsonTraceExporter({
					url: 'https://otel.highlight.io:4318/v1/traces',
				}),
				instrumentationConfig: {
					fetch: {
						propagateContextUrls: ['*'],
					},
				},
				attributes: {
					'highlight.source': 'backend',
					'service.version': nodeOptions.serviceVersion,
					'deployment.environment': nodeOptions.environment,
					...nodeOptions.attributes,
				},
			})
		}

		H.init(nodeOptions)
	} else {
		console.info(
			`Highlight not registered: NEXT_RUNTIME=${process.env.NEXT_RUNTIME}`,
		)
	}
}
