// pages/_error.tsx
import {
	pageRouterCustomErrorHandler,
	PageRouterErrorProps,
} from '@highlight-run/next/ssr'
import NextError from 'next/error'

export default pageRouterCustomErrorHandler(
	{
		projectId: '4d7k1xeo',
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
