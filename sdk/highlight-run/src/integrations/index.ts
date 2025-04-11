import type { ErrorMessage, Source } from '../client/types/shared-types'
import { Metric } from '../client'

export interface IntegrationClient {
	init(sessionSecureID: string): void

	identify(
		sessionSecureID: string,
		user_identifier: string,
		user_object: object,
		source?: Source,
	): void

	error(sessionSecureID: string, error: ErrorMessage): void

	track(sessionSecureID: string, metadata: object): void

	recordMetric: (sessionSecureID: string, metric: Metric) => void
}
