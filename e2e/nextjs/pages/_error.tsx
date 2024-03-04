// pages/_error.tsx
import NextError from 'next/error'
import {
	pageRouterCustomErrorHandler,
	PageRouterErrorProps,
} from '@highlight-run/next/ssr'
import { CONSTANTS } from '@/constants'

export default pageRouterCustomErrorHandler(
	{
		projectId: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		// ...otherHighlightOptions
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
