// pages/_error.tsx
import NextError from 'next/error'
import {
	pageRouterCustomErrorHandler,
	PageRouterErrorProps,
} from '@highlight-run/next/ssr'
import { highlightConfig } from '@/highlight.config'

export default pageRouterCustomErrorHandler(
	{
		...highlightConfig,
		serviceName: highlightConfig.serviceName + '-error',
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
