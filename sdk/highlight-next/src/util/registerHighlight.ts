import { NodeOptions } from '@highlight-run/node'

export async function registerHighlight(nodeOptions: NodeOptions) {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { H } = await import('@highlight-run/node')

		H.init(nodeOptions)
	} else {
		console.info(
			`Highlight not registered: NEXT_RUNTIME=${process.env.NEXT_RUNTIME}`,
		)
	}
}
