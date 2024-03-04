import build from 'pino-abstract-transport'
import type { NodeOptions } from '@highlight-run/node'

export type { NodeOptions }
export default async function (options: NodeOptions) {
	// do nothing in next.js non-node runtimes
	if (
		typeof process.env.NEXT_RUNTIME !== 'undefined' &&
		process.env.NEXT_RUNTIME !== 'nodejs'
	) {
		return build(async () => {})
	}
	const { H } = await import('@highlight-run/node')
	if (!H.isInitialized()) {
		H.init(options)
	}

	if (!options.projectID) {
		throw new Error('Highlight projectID not set')
	}

	return build(
		async function (source) {
			const context = H.parseHeaders({})
			for await (const obj of source) {
				const { msg, level, ...rest } = obj
				let levelStr: string
				switch (level) {
					case 10:
						levelStr = 'trace'
						break
					case 20:
						levelStr = 'debug'
						break
					case 30:
						levelStr = 'info'
						break
					case 40:
						levelStr = 'warn'
						break
					case 50:
						levelStr = 'error'
						break
					case 60:
						levelStr = 'fatal'
						break
					default:
						levelStr = 'info'
				}
				try {
					H.log(
						msg,
						levelStr,
						context.secureSessionId,
						context.requestId,
						rest,
					)
				} catch (error) {
					console.error(
						`Failed to ingest logs to highlight: ${error}`,
					)
				}
			}
		},
		{
			async close(err) {
				try {
					await H.flush()
				} catch (error) {
					console.error(`Failed to flush logs to highlight: ${error}`)
				}
			},
		},
	)
}
