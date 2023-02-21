import { H } from '@highlight-run/cloudflare'

async function doRequest() {
	/**
	 * Example someHost at URL is set up to respond with HTML
	 * Replace URL with the host you wish to send requests to
	 */
	const someHost = 'https://highlight.io'
	const url = someHost + '/index.js'

	/**
	 * gatherResponse awaits and returns a response body as a string.
	 * Use await gatherResponse(..) in an async function to get the response body
	 * @param {Response} response
	 */
	async function gatherResponse(response: any) {
		if (Math.random() < 0.2) {
			throw new Error('random error from cloudflare worker!')
		}
		const { headers } = response
		const contentType = headers.get('content-type') || ''
		if (contentType.includes('application/json')) {
			return JSON.stringify(await response.json())
		} else if (contentType.includes('application/text')) {
			return response.text()
		} else if (contentType.includes('text/html')) {
			return response.text()
		} else {
			return response.text()
		}
	}

	const init = {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
	}

	const response = await fetch(url, init)
	const results = await gatherResponse(response)
	return new Response(results, init)
}

export default {
	async fetch(request: Request, env: {}, ctx: ExecutionContext) {
		const hEnv = { HIGHLIGHT_PROJECT_ID: '1' }
		try {
			const response = await doRequest()
			H.sendResponse(request, hEnv, ctx, response)
			return response
		} catch (e: any) {
			H.consumeError(request, hEnv, ctx, e)
			throw e
		}
	},
}
