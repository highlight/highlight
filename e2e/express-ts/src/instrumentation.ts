import { H, Handlers } from '@highlight-run/node'
import { CONSTANTS } from './constants'

/** @type {import('@highlight-run/node').NodeOptions} */
export const config = {
	otlpEndpoint: CONSTANTS.HIGHLIGHT_OTLP_ENDPOINT,
	projectID: CONSTANTS.HIGHLIGHT_PROJECT_ID ?? '1',
	debug: false,
	serviceName: 'e2e-express-ts',
	serviceVersion: 'vadim',
	environment: 'e2e-test',
}
H.init(config)

export { H, Handlers }
