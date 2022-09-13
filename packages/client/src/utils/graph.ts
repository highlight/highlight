import { logForHighlight } from './highlight-logging'

export const MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS = 5

// Initial backoff for retrying graphql requests.
export const INITIAL_BACKOFF = 300

export const getGraphQLRequestWrapper = (sessionSecureID: string) => {
	const graphQLRequestWrapper = async <T>(
		requestFn: () => Promise<T>,
		operationName: string,
		operationType?: string,
		retries: number = 0,
	): Promise<T> => {
		try {
			return await requestFn()
		} catch (error: any) {
			if (retries < MAX_PUBLIC_GRAPH_RETRY_ATTEMPTS) {
				await new Promise((resolve) =>
					setTimeout(resolve, INITIAL_BACKOFF * Math.pow(2, retries)),
				)
				return await graphQLRequestWrapper(
					requestFn,
					operationName,
					operationType,
					retries + 1,
				)
			}
			logForHighlight(
				'[' +
					(sessionSecureID || sessionSecureID) +
					'] Request failed after ' +
					retries +
					' retries',
			)
			throw error
		}
	}
	return graphQLRequestWrapper
}
