import { SESSION_STORAGE_KEYS } from './sessionStorageKeys'
import { getItem, removeItem, setItem } from '../storage'
import { SESSION_PUSH_THRESHOLD } from '../../constants/sessions'

export type SessionData = {
	sessionSecureID: string
	projectID: number
	payloadID: number
	sessionStartTime?: number
	lastPushTime?: number
	userIdentifier?: string
	userObject?: Object
}

const getSessionDataKey = (sessionID: string): string => {
	return `${SESSION_STORAGE_KEYS.SESSION_DATA}_${sessionID}`
}

export const getSessionSecureID = (): string => {
	return getItem(SESSION_STORAGE_KEYS.SESSION_ID) ?? ''
}

export const setSessionSecureID = (secureID: string) => {
	setItem(SESSION_STORAGE_KEYS.SESSION_ID, secureID)
}

const getSessionData = (sessionID: string): SessionData | undefined => {
	const key = getSessionDataKey(sessionID)
	let storedSessionData = JSON.parse(getItem(key) || '{}')
	return storedSessionData as SessionData
}

export const getPreviousSessionData = (
	sessionID?: string,
): SessionData | undefined => {
	if (!sessionID) {
		sessionID = getSessionSecureID()
	}
	let storedSessionData = getSessionData(sessionID)
	if (
		storedSessionData &&
		storedSessionData.lastPushTime &&
		Date.now() - storedSessionData.lastPushTime < SESSION_PUSH_THRESHOLD
	) {
		return storedSessionData as SessionData
	} else {
		removeItem(getSessionDataKey(sessionID))
	}
}

export const setSessionData = function (sessionData?: SessionData) {
	if (!sessionData?.sessionSecureID) return
	const secureID = sessionData.sessionSecureID!
	setItem(getSessionDataKey(secureID), JSON.stringify(sessionData))
}
