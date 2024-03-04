import * as trpcNext from '@trpc/server/adapters/next'

import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { H, Handlers } from '@highlight-run/node'
import { CONSTANTS } from '@/constants'

const t = initTRPC.create()

H.init({ projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID })

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
				projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
				serviceName: 'my-trpc-app',
				serviceVersion: 'test-git-sha',
			},
		)
		console.error(error)
	},
})

export type AppRouter = typeof appRouter
