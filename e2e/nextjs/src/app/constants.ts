// src/app/constants.ts
import { z } from 'zod'

const stringOrUndefined = z.preprocess(
	(val) => val || undefined,
	z.string().optional(),
)

const CONSTANTS = z
	.object({
		NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID: z.string(),
		NEXT_PUBLIC_HIGHLIGHT_OTLP_ENDPOINT: stringOrUndefined,
		NEXT_PUBLIC_HIGHLIGHT_BACKEND_URL: stringOrUndefined,
	})
	.parse(process.env)

export default CONSTANTS
