import { H } from '@highlight-run/next/server'
import pino from 'pino'

const env = {
	projectID: '4d7k1xeo',
	debug: false,
	serviceName: 'highlight.io',
}
H.init(env)

export const logger = pino({
	transport: {
		targets: [
			{
				target: '@highlight-run/pino',
				options: {
					projectID: '4d7k1xeo',
					serviceName: 'highlight.io-pino',
				},
				level: 'trace',
			},
		],
	},
})
