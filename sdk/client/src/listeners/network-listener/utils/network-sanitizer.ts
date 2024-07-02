import { Request, Response, Headers } from './models'

export const sanitizeResource = <T extends Request | Response>(
	resource: T,
	headersToRedact: string[],
	headersToRecord?: string[],
): T => {
	const newHeaders = sanitizeHeaders(
		headersToRedact,
		resource.headers,
		headersToRecord,
	)

	return {
		...resource,
		headers: newHeaders,
	}
}

export const sanitizeHeaders = (
	headersToRedact: string[],
	headers?: Headers,
	headersToRecord?: string[],
) => {
	const newHeaders = { ...headers }

	// `headersToRecord` overrides `headersToRedact`.
	if (headersToRecord) {
		Object.keys(newHeaders)?.forEach((header: string) => {
			// Only keep the keys that are specified in `headersToRecord`.
			if (![...headersToRecord].includes(header?.toLowerCase())) {
				newHeaders[header] = '[REDACTED]'
			}
		})

		return newHeaders
	}

	Object.keys(newHeaders)?.forEach((header: string) => {
		// Redact all the keys in `headersToRedact`.
		if (
			[...SENSITIVE_HEADERS, ...headersToRedact].includes(
				header?.toLowerCase(),
			)
		) {
			newHeaders[header] = '[REDACTED]'
		}
	})

	return newHeaders
}

/** These are known headers that are secrets. */
const SENSITIVE_HEADERS = [
	'authorization',
	'cookie',
	'proxy-authorization',
	'token',
]

/** Known URLs that contains secrets. */
export const DEFAULT_URL_BLOCKLIST = [
	'https://www.googleapis.com/identitytoolkit',
	'https://securetoken.googleapis.com',
]
