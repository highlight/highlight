import { httpBatchLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { AppRouter } from '../../../pages/api/trpc/[trpc]'

// See: https://trpc.io/docs/nextjs/setup#4-create-trpc-hooks

export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		const url = `${getBaseUrl()}/api/trpc`

		return {
			links: [
				httpBatchLink({
					/**
					 * If you want to use SSR, you need to use the server's full URL
					 * @link https://trpc.io/docs/ssr
					 **/
					url,

					// You can pass any HTTP headers you wish here
					async headers() {
						return {
							// authorization: getAuthCookie(),
						}
					},
				}),
			],
		}
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 **/
	ssr: false,
})

function getBaseUrl() {
	switch (true) {
		case typeof window !== 'undefined':
			return ''
		case !!process.env.VERCEL_URL:
			return `https://${process.env.VERCEL_URL}`
		case !!process.env.RENDER_INTERNAL_HOSTNAME:
			return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
		default:
			return `http://localhost:${process.env.PORT ?? 3000}`
	}
}
