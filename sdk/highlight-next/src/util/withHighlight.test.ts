import { NextApiHandler } from 'next'
import { Highlight } from './with-highlight-nodejs-page-router'

import { createNextApiHandler } from '@trpc/server/adapters/next'
import * as trpc from '@trpc/server'

describe('withHighlight', () => {
	const withHighlight = Highlight({ projectID: 'test' })

	it('compiles when used with the latest NextApiHandler', async () => {
		const toWrap: NextApiHandler = () => {}
		withHighlight(toWrap)
	})

	it('compiles when used with a tRPC router', async () => {
		const toWrap = createNextApiHandler({
			router: trpc.router(),
		})
		withHighlight(toWrap)
	})
})
