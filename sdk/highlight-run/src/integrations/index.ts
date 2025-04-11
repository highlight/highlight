import type { ErrorMessage, Source } from '../client/types/shared-types'

export interface IntegrationClient {
	identify(
		sessionSecureID: string,
		user_identifier: string,
		user_object: object,
		source?: Source,
	): void

	error(sessionSecureID: string, error: ErrorMessage): void

	track(sessionSecureID: string, metadata: object): void
}
