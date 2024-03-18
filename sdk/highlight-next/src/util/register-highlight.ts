import type { NodeOptions } from '@highlight-run/node'
import { isNodeJsRuntime } from './is-node-js-runtime'

export async function registerHighlight(nodeOptions: NodeOptions) {
	if (isNodeJsRuntime()) {
		const { H } = await import('@highlight-run/node')

		H.init(nodeOptions)
	} else {
		console.info(
			`Highlight not registered: NEXT_RUNTIME=${process.env.NEXT_RUNTIME}`,
		)
	}
}
