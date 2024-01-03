// src/app/constants.ts
import { z } from 'zod'

const stringOrUndefined = z.preprocess(
	(val) => val || undefined,
	z.string().optional(),
)

// Must assign NEXT_PUBLIC_* env vars to a variable to force Next to inline them
const publicEnv = {
	NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID:
		process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID,
	NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT:
		process.env.NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT,
	NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL:
		process.env.NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL,
	NEXT_PUBLIC_HIGHLIGHT_SCRIPT_URL:
		process.env.NEXT_PUBLIC_HIGHLIGHT_SCRIPT_URL,
}

export const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
		NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: stringOrUndefined,
		NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL: stringOrUndefined,
		NEXT_PUBLIC_HIGHLIGHT_SCRIPT_URL: stringOrUndefined,
	})
	.parse(publicEnv)
