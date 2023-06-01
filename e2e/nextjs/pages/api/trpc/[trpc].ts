import * as trpcNext from '@trpc/server/adapters/next'

import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const router = t.router
export const publicProcedure = t.procedure

const appRouter = router({
	helloWorld: publicProcedure
		.input(z.object({ message: z.string() }))
		.query(async ({ input }) => {
			return { hello: 'world', ...input }
		}),
})

export default trpcNext.createNextApiHandler({
	router: appRouter,
	createContext: () => ({}),
})

export type AppRouter = typeof appRouter
