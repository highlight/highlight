import { siteUrl } from '../../../../utils/urls'
import { jsGetSnippet } from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const NextJsTracesContent: QuickStartContent = {
	title: 'Next.js',
	subtitle:
		'Learn how to set up highlight.io tracing for your Next.js application.',
	logoUrl: siteUrl('/images/quickstart/nextjs.svg'),
	entries: [
		jsGetSnippet(['next']),
		{
			title: 'Wrap your Page Router endpoints',
			content:
				'The Highlight Next.js SDK supports tracing for both Page and App Routers running in the Node.js runtime.',
			code: [
				{
					text: `import { NextApiRequest, NextApiResponse } from 'next'

import { withPageRouterHighlight } from '@/app/_utils/page-router-highlight.config'
import { H } from '@highlight-run/next/server'

export default withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return new Promise<void>(async (resolve) => {
		const span = await H.startActiveSpan('page-router-span', {})

		console.info('Here: /pages/api/page-router-trace.ts ⌚⌚⌚')

		res.send(\`Trace sent! Check out this random number: ${Math.random()}\`)
		span.end()
		resolve()
	})
})
					`,
					language: 'js',
				},
			],
		},
		{
			title: 'Wrap your App Router endpoints',
			content:
				'The Highlight Next.js SDK supports tracing for both Page and App Routers running in the Node.js runtime.',
			code: [
				{
					text: `import { NextRequest, NextResponse } from 'next/server'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'
import { H } from '@highlight-run/next/server'

export const GET = withAppRouterHighlight(async function GET(
	request: NextRequest,
) {
	return new Promise(async (resolve) => {
		const span = await H.startActiveSpan('app-router-span', {})

		console.info('Here: /pages/api/app-router-trace/route.ts ⏰⏰⏰')

		span.end()

		resolve(new Response('Success: /api/app-router-trace'))
	})
})
					`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}
