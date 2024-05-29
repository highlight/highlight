import { ClientError } from 'graphql-request'
import { PublicGraphError } from '../graph/generated/schemas'

export const MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS = 10

// Initial backoff for retrying graphql requests.
export const BASE_DELAY_MS = 1000
export const BACKOFF_DELAY_MS = 500

// Do not retry if any of these public graph errors are thrown
const NON_RETRYABLE_ERRORS = [PublicGraphError.BillingQuotaExceeded.toString()]

// A `ClientError` is retryable if none of the response errors is non-retryable
const isErrorRetryable = (error: ClientError): boolean => {
	const match = error.response.errors?.find((e) =>
		NON_RETRYABLE_ERRORS.includes(e.message),
	)
	return match === undefined
}

export const getGraphQLRequestWrapper = (sessionSecureID: string) => {
	const graphQLRequestWrapper = async <T>(
		requestFn: () => Promise<T>,
		operationName: string,
		operationType?: string,
		variables?: any,
		retries: number = 0,
	): Promise<T> => {
		try {
			return await requestFn()
		} catch (error: any) {
			if (error instanceof ClientError && !isErrorRetryable(error)) {
				throw error
			}

			if (retries < MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS) {
				await new Promise((resolve) =>
					setTimeout(
						resolve,
						BASE_DELAY_MS + BACKOFF_DELAY_MS * Math.pow(2, retries),
					),
				)
				return await graphQLRequestWrapper(
					requestFn,
					operationName,
					operationType,
					variables,
					retries + 1,
				)
			}
			console.error(
				`highlight.io: [${
					sessionSecureID || sessionSecureID
				}] data request failed after ${retries} retries`,
			)
			throw error
		}
	}
	return graphQLRequestWrapper
}
