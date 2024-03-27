import * as trpcNext from '@trpc/server/adapters/next'

import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { H, Handlers } from '@highlight-run/node'
import { highlightConfig } from '@/highlight.config'

const t = initTRPC.create()

H.init({
	...highlightConfig,
	serviceName: highlightConfig.serviceName + '-trpc',
})

export const router = t.router
export const publicProcedure = t.procedure

const appRouter = router({
	helloWorld: publicProcedure
		.input(z.object({ message: z.string() }))
		.query(async ({ input }) => {
			return { hello: 'world', ...input }
		}),
	throwError: publicProcedure.mutation(() => {
		throw new Error('🤖 tRPC error! ⚠️')
	}),
})

export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext: () => ({}),
	onError: ({ error, req }) => {
		Handlers.trpcOnError(
			{ error, req },
			{
				...highlightConfig,
				serviceName: highlightConfig.serviceName + '-trpc-onerror',
			},
		)
		console.error(error)
	},
})

export type AppRouter = typeof appRouter
