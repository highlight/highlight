import * as trpcNext from '@trpc/server/adapters/next'

import { highlightConfig } from '@/instrumentation'
import { Handlers } from '@highlight-run/node'
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

/**
 * H MUST be imported from @highlight-run/next/server.
 * Importing from @highlight-run/node is a disaster.
 * It breaks the span context spreading pattern implemented in CustomSpanProcess
 * in @highlight-run/node/src/client.ts.
 *
 * Even better... don't initialize this at all and let the API wrappers do their own thing.
 * It simplifies the trace tree significantly. This H.init captures all sorts of noise.
 */
// H.init(highlightConfig)

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
				serviceName: 'my-trpc-app',
				serviceVersion: 'test-git-sha',
			},
		)
		console.error(error)
	},
})

export type AppRouter = typeof appRouter
