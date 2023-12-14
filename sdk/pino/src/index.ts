import build from 'pino-abstract-transport'
import { H as NodeH } from '@highlight-run/node'
import type { NodeOptions } from '@highlight-run/node'

export type { NodeOptions }
export default async function (options: NodeOptions) {
	if (!NodeH.isInitialized()) {
		NodeH.init(options)
	}

	if (!options.projectID) {
		throw new Error('Highlight projectID not set')
	}

	return build(
		async function (source) {
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
					NodeH.log(msg, levelStr, undefined, undefined, rest)
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
					await NodeH.flush()
				} catch (error) {
					console.error(`Failed to flush logs to highlight: ${error}`)
				}
			},
		},
	)
}
