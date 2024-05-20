import { SESSION_STORAGE_KEYS } from './sessionStorageKeys'
import { getItem } from '../storage'
import { SESSION_PUSH_THRESHOLD } from '../../constants/sessions'

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
