import { H, NodeOptions } from '@highlight-run/node'
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
				try {
					await next()
				} finally {
					if (c.error) {
						H.consumeError(c.error)
					}
				}
			},
			{
				attributes: {
					'http.method': c.req.method,
					'http.route': c.req.path,
					'http.url': c.req.url,
				},
			},
		)
	})
}
