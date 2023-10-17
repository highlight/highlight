// src/app/constants.ts

declare global {
	interface Window {
		ENV: {
			HIGHLIGHT_PROJECT_ID: string
		}
	}
}

const env = typeof window === 'object' ? window.ENV : process.env

export const CONSTANTS = {
	HIGHLIGHT_PROJECT_ID: env.HIGHLIGHT_PROJECT_ID || '1',
}
