// pages/_error.tsx
import {
	pageRouterCustomErrorHandler,
	PageRouterErrorProps,
} from '@highlight-run/next/ssr'
import NextError from 'next/error'

export default pageRouterCustomErrorHandler(
	{
		projectId: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID!,
		otlpEndpoint: 'https://otel.observability.app.launchdarkly.com',
	},
	/**
	 *
	 * This second argument is purely optional.
	 * If you don't pass it, we'll use the default Next.js error page.
	 *
	 * Go ahead and pass in your own error page.
	 */
	(props: PageRouterErrorProps) => <NextError {...props} />,
)
