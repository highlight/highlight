import pino from 'pino'

export function startPino() {
	const logger = pino({
		transport: {
			targets: [
				{
					target: '@highlight-run/pino',
					options: {
						projectID: '1',
						debug: true,
						serviceVersion: 'git-sha',
						otlpEndpoint: 'http://localhost:4318',
						serviceName: 'e2e-express-pino',
					},
					level: 'info',
				},
				{
					target: 'pino-pretty',
					options: {
						colorize: true,
					},
					level: 'info',
				},
			],
		},
	})

	logger.info('hello world')

	const child = logger.child({ a: 'property' })

	child.info('hello child!')
}
