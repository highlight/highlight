// instrumentation.ts
import CONSTANTS from '@/app/constants'

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		/**
		 * Conditional import required for use with Next middleware
		 *
		 * Avoids the following error:
		 * An error occurred while loading instrumentation hook: (0 , _highlight_run_next__WEBPACK_IMPORTED_MODULE_1__.registerHighlight) is not a function
		 */
		const { registerHighlight } = await import('@highlight-run/next/server')

		registerHighlight({
			projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
			otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
			serviceName: 'my-nextjs-backend',
		})
	}
}
