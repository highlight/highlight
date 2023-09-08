import build from 'pino-abstract-transport'
import { H as NodeH } from '@highlight-run/node'
import type { NodeOptions } from '@highlight-run/node'

export type { NodeOptions }
export function highlightTransport(options: NodeOptions) {
	if (!NodeH.isInitialized()) {
		NodeH.init(options)
	}

	if (!options.projectID) {
		throw new Error('Highlight projectID not set')
	}

	return build(
		async (source) => {
			for await (const obj of source) {
				const { level, msg, ...rest } = obj

				try {
					NodeH.log(msg, level, rest)
				} catch (error) {
					console.error(
						`Failed to ingest logs to highlight: ${error}`,
					)
				}
			}
		},
		{
			close: async () => {
				try {
					await NodeH.flush()
				} catch (error) {
					console.error(`Failed to flush logs to highlight: ${error}`)
				}
			},
		},
	)
}
