import { registerHighlight } from '@highlight-run/next'
import { z } from 'zod'

const env = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
		NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: z.string(),
	})
	.parse(process.env)

export async function register() {
	registerHighlight({
		projectID: env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
		otlpEndpoint: env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	})
}
