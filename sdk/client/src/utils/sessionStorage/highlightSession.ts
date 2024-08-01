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

const getSessionData = (): SessionData | undefined => {
	let storedSessionData = JSON.parse(
		getItem(SESSION_STORAGE_KEYS.SESSION_DATA) || '{}',
	)
	return storedSessionData as SessionData
}

export const getPreviousSessionData = (): SessionData | undefined => {
	let storedSessionData = getSessionData()
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
		// preserve sessionSecureID as that is used by network listeners
		setItem(
			SESSION_STORAGE_KEYS.SESSION_DATA,
			JSON.stringify({
				sessionSecureID: getSessionData()?.sessionSecureID,
			}),
		)
		return
	}
	setItem(SESSION_STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData))
}

export const getSessionSecureID = function () {
	const data = getSessionData()
	return data?.sessionSecureID ?? ''
}

export const setSessionSecureID = function (sessionSecureID: string) {
	const data = getSessionData() ?? ({ sessionSecureID } as SessionData)
	data.sessionSecureID = sessionSecureID
	return setSessionData(data)
}
