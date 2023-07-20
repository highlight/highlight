// src/app/constants.ts

declare global {
	interface Window {
		ENV: {
			HIGHLIGHT_PROJECT_ID: string
			HIGHLIGHT_OTLP_ENDPOINT?: string
			HIGHLIGHT_BACKEND_URL?: string
		}
	}
}

const env = typeof window === 'object' ? window.ENV : process.env

export const CONSTANTS = {
	HIGHLIGHT_PROJECT_ID: env.HIGHLIGHT_PROJECT_ID || '1',
	HIGHLIGHT_OTLP_ENDPOINT: env.HIGHLIGHT_OTLP_ENDPOINT,
	HIGHLIGHT_BACKEND_URL: env.HIGHLIGHT_BACKEND_URL,
}
