import { H, Handlers } from '@highlight-run/node'

/** @type {import('@highlight-run/node').NodeOptions} */
export const config = {
	projectID: '1',
	debug: true,
	serviceName: 'e2e-express-ts',
	serviceVersion: 'git-sha',
	otlpEndpoint: 'http://localhost:4318',
	environment: 'e2e-test',
}
H.init(config)

export { H, Handlers }
