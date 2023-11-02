// instrumentation.ts
import { CONSTANTS } from '@/constants'

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { registerHighlight } = await import('@highlight-run/next/server')

		registerHighlight({
			projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
			otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
			serviceName: 'my-nextjs-backend',
		})
	}
}
