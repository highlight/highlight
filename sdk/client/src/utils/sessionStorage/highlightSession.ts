import { SESSION_STORAGE_KEYS } from './sessionStorageKeys'
import { getItem, removeItem, setItem } from '../storage'
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

export const setSessionData = function (sessionData: SessionData | null) {
	if (sessionData === null) {
		removeItem(SESSION_STORAGE_KEYS.SESSION_DATA)
		// preserve SESSION_STORAGE_KEYS.SESSION_SECURE_ID as that is used by network listeners
		return
	}
	setItem(SESSION_STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData))
	setSessionSecureID(sessionData.sessionSecureID)
}

export const getSessionSecureID = function () {
	return getItem(SESSION_STORAGE_KEYS.SESSION_SECURE_ID) ?? ''
}

export const setSessionSecureID = function (sessionSecureID: string) {
	return setItem(SESSION_STORAGE_KEYS.SESSION_SECURE_ID, sessionSecureID)
}
