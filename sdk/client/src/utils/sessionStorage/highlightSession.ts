import { SESSION_STORAGE_KEYS } from './sessionStorageKeys'
import { getItem } from '../storage'

/**
 * The amount of time allowed after the last push before creating a new session.
 * In milliseconds.
 */
const SESSION_PUSH_THRESHOLD = 1000 * 55

export type SessionData = {
	sessionSecureID: string
	projectID: number
	sessionStartTime?: number
	lastPushTime?: number
	userIdentifier?: string
	userObject?: Object
}

export const getPreviousSessionData = (): SessionData | undefined => {
	let storedSessionData = JSON.parse(
		getItem(SESSION_STORAGE_KEYS.SESSION_DATA) || '{}',
	)
	if (
		storedSessionData &&
		storedSessionData.lastPushTime &&
		Date.now() - storedSessionData.lastPushTime < SESSION_PUSH_THRESHOLD
	) {
		return storedSessionData as SessionData
	}
}
