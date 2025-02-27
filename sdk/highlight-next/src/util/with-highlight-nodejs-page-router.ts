import { NodeOptions } from '@highlight-run/node'
import { H } from './highlight-node'

import type { IncomingHttpHeaders } from 'http'

export declare type HasHeaders = {
	headers: IncomingHttpHeaders
	method?: string
	url?: string
}
export declare type HasStatus = {
	readonly statusCode: number
	readonly statusMessage: string
	status: (statusCode: number) => HasStatus
	send: (body: string) => void
}
export declare type ApiHandler<T extends HasHeaders, S extends HasStatus> = (
	req: T,
	res: S,
) => unknown | Promise<unknown>

export const Highlight =
	(options: NodeOptions) =>
	<T extends HasHeaders, S extends HasStatus>(
		originalHandler: ApiHandler<T, S>,
	): ApiHandler<T, S> => {
		const NodeH = H.init(options)

		return async (req, res) => {
			if (!NodeH) throw new Error('Highlight not initialized')

			return await H.runWithHeaders(
				`${req.method?.toUpperCase()} - ${req.url}`,
				req.headers,
				async () => {
					return await originalHandler(req, res)
				},
			)
		}
	}

// this code was assisted by https://github.com/getsentry/sentry-javascript/blob/2f2d099dcc668f12109913caf36097f73a1bc966/packages/nextjs/src/utils/withSentry.ts
