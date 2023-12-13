import pino from 'pino'

// returns a pino logger. to be called after highlight is initialized
export const getLogger = () => {
	const env = {
		projectID: '4d7k1xeo',
		debug: false,
		serviceName: 'highlight.io',
	}
	return pino({
		transport: {
			targets: [
				{
					target: '@highlight-run/pino',
					options: env,
					level: 'trace',
				},
			],
		},
	})
}
