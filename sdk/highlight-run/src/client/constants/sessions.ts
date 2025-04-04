/**
 *  The amount of time to wait until sending the first payload.
 */
export const FIRST_SEND_FREQUENCY = 1000
/**
 * The amount of time between sending the client-side payload to Highlight backend client.
 * In milliseconds.
 */
export const SEND_FREQUENCY = 1000 * 2

/**
 * Maximum length of a session
 */
export const MAX_SESSION_LENGTH = 4 * 60 * 60 * 1000

/**
 * The amount of time allowed after the last push before creating a new session.
 * In milliseconds.
 */
export const SESSION_PUSH_THRESHOLD = 15 * 60 * 1000

/*
 * Don't take another full snapshot unless it's been at least
 * 4 minutes AND the cumulative payload size since the last
 * snapshot is > 10MB.
 */
export const SNAPSHOT_SETTINGS = {
	normal: {
		bytes: 10e6,
		time: 4 * 60 * 1000,
	},
	canvas: {
		bytes: 16e6,
		time: 5000,
	},
} as const

// Debounce duplicate visibility events
export const VISIBILITY_DEBOUNCE_MS = 100

// Max allowed time to upload to public graph before triggering recording kill switch
export const UPLOAD_TIMEOUT = 1000 * 15

export const HIGHLIGHT_URL = 'app.highlight.io'
