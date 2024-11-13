import { H, NodeOptions } from '@highlight-run/node'
import type { MiddlewareHandler } from 'hono'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

/**
 * Creates a Hono middleware that automatically traces requests and reports errors to Highlight
 */
export const highlightMiddleware = (options: NodeOptions) => {
	if (!H.isInitialized()) {
		H.init(options)
	}

	return createMiddleware(async (c, next) => {
		const spanName = `${c.req.method} ${c.req.path}`
		const headers = c.req.header()

		// Run the request handler with Highlight tracing
		await H.runWithHeaders(
			spanName,
			headers,
			async () => {
				await next()
			},
			{
				attributes: {
					'http.method': c.req.method,
					'http.route': c.req.path,
					'http.url': c.req.url,
				},
			},
		)

		if (c.error) {
			H.consumeError(c.error)
		}
	})
}
