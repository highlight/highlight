import { PageRouterHighlight } from '@highlight-run/next/server'

export const withPageRouterHighlight = PageRouterHighlight({
	projectID: '4d7k1xeo',
	debug: false,
	serviceName: 'highlight.io',
})

import pino from 'pino'
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
