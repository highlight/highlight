// instrumentation.ts or src/instrumentation.ts
import { CONSTANTS } from '@/constants'
import type { NodeOptions } from '@highlight-run/node'
import { isNodeJsRuntime } from '@highlight-run/next/server'
import { highlightConfig } from './highlight.config'

export async function register() {
	console.log('instrumentation.ts register', {
		isNodeJsRuntime: isNodeJsRuntime(),
	})
	const { registerHighlight } = await import('@highlight-run/next/server')
	await registerHighlight({
		...highlightConfig,
		serviceName: highlightConfig.serviceName + '-register',
	})
}
