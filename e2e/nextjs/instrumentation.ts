// instrumentation.ts
import CONSTANTS from '@/app/constants'
import { registerHighlight } from '@highlight-run/next'

export async function register() {
	registerHighlight({
		projectID: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: CONSTANTS.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
