import { H, NodeOptions } from '@highlight-run/node'
import type { DataFunctionArgs } from '@remix-run/node'
import { SESSION_STORAGE_KEYS } from '@highlight-run/client/src/utils/sessionStorage/sessionStorageKeys'

export { H } from '@highlight-run/node'

export function HandleError(nodeOptions: NodeOptions) {
	H.init(nodeOptions)

	return function handleError(error: unknown, { request }: DataFunctionArgs) {
		if (error instanceof Error) {
			const cookies = parseCookies(request.headers.get('Cookie') ?? '')

			H.consumeError(
				error,
				cookies[SESSION_STORAGE_KEYS.SESSION_SECURE_ID],
			)
		}
	}
}

function parseCookies(cookies: string) {
	return Object.fromEntries(
		cookies.split(';').map((c) => c.trim().split('=')),
	)
}
