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
				try {
					NodeH.log(msg, level, undefined, undefined, rest)
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
