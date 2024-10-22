import { H, NodeOptions } from '@highlight-run/node'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { SESSION_SECURE_ID } from './constants'

export { H } from '@highlight-run/node'

export function HandleError(nodeOptions: NodeOptions) {
	H.init(nodeOptions)

	return function handleError(
		error: unknown,
		{ request }: LoaderFunctionArgs | ActionFunctionArgs,
	) {
		if (error instanceof Error) {
			const cookies = parseCookies(request.headers.get('Cookie') ?? '')

			H.consumeError(error, cookies[SESSION_SECURE_ID])
		}
	}
}

function parseCookies(cookies: string) {
	return Object.fromEntries(
		cookies.split(';').map((c) => c.trim().split('=')),
	)
}
