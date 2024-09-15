import { SESSION_STORAGE_KEYS } from '../utils/sessionStorage/sessionStorageKeys'
import { getItem, monkeyPatchLocalStorage, setItem } from '../utils/storage'

enum SEGMENT_LOCAL_STORAGE_KEYS {
	USER_ID = 'ajs_user_id',
	USER_TRAITS = 'ajs_user_traits',
	ANONYMOUS_ID = 'ajs_anonymous_id',
}

export const SegmentIntegrationListener = (callback: (obj: any) => void) => {
	callback(window.location.href)
	var send = XMLHttpRequest.prototype.send
	XMLHttpRequest.prototype.send = function (data: any) {
		setTimeout(() => {
			var obj: any
			try {
				obj = JSON.parse(data?.toString() ?? '')
			} catch (e) {
				return
			}
			if (obj.type === 'track' || obj.type === 'identify') {
				if (shouldSend(obj)) {
					callback(obj)
				}
			}
		}, 100)
		send.call(this, data)
	}

	const localStorageHandler = (e: Pick<StorageEvent, 'key'>) => {
		if (
			e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_ID'] ||
			e.key === SEGMENT_LOCAL_STORAGE_KEYS['ANONYMOUS_ID'] ||
			e.key === SEGMENT_LOCAL_STORAGE_KEYS['USER_TRAITS']
		) {
			const { userId, userTraits } = getLocalStorageValues()

			if (userId) {
				let parsedUserTraits = {}
				if (userTraits) {
					parsedUserTraits = JSON.parse(userTraits)
				}
				const payload = {
					type: 'identify',
					userId: userId.toString(),
					traits: parsedUserTraits,
				}

				if (shouldSend(payload)) {
					callback(payload)
				}
			}
		}
	}

	const { userId, userTraits } = getLocalStorageValues()

	if (userId) {
		let parsedUserTraits = {}
		if (userTraits) {
			parsedUserTraits = JSON.parse(userTraits)
		}
		const payload = {
			type: 'identify',
			userId: userId.toString(),
			traits: parsedUserTraits,
		}

		if (shouldSend(payload)) {
			callback(payload)
		}
	}

	window.addEventListener('storage', localStorageHandler)

	// `window.addEventListener('storage', localStorageHandler)` only gets called when the storage
	// is changed on a different window/tab. Same-page changes do not cause an event to get created.
	// This breaks our use case here since Segment sets the localStorage values on the same tab that
	// Highlight is running on. Without this, we won't be able to read the Segment identify values.
	monkeyPatchLocalStorage(({ keyName }) => {
		const mockStorageEvent = {
			key: keyName,
		}

		localStorageHandler(mockStorageEvent)
	})

	return () => {
		window.removeEventListener('storage', localStorageHandler)
		XMLHttpRequest.prototype.send = send
	}
}

const getLocalStorageValues = () => {
	const userId = getItem(SEGMENT_LOCAL_STORAGE_KEYS['USER_ID'])
	const userTraits = getItem(SEGMENT_LOCAL_STORAGE_KEYS['USER_TRAITS'])
	const anonymousId = getItem(SEGMENT_LOCAL_STORAGE_KEYS['ANONYMOUS_ID'])

	return {
		userId,
		userTraits,
		anonymousId,
	}
}

/**
 * Whether or not to send a Segment event.
 * We need to do this so we don't send duplicate events.
 * Duplicates are triggered whenever a localStorage change happens even when it's not changing a Segment value.
 */
const shouldSend = (payload: any) => {
	if (!Boolean(payload)) {
		return false
	}
	let hashMessage = ''

	try {
		hashMessage = JSON.stringify(payload)
	} catch {
		return false
	}

	const hashDigest = hashCode(hashMessage)

	const lastSentHash = getItem(
		SESSION_STORAGE_KEYS.SEGMENT_LAST_SENT_HASH_KEY,
	)

	if (lastSentHash === undefined) {
		setItem(SESSION_STORAGE_KEYS.SEGMENT_LAST_SENT_HASH_KEY, hashDigest)
		return true
	}

	if (hashDigest !== lastSentHash) {
		setItem(SESSION_STORAGE_KEYS.SEGMENT_LAST_SENT_HASH_KEY, hashDigest)
		return true
	}

	return false
}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
const hashCode = (s: string) => {
	var h = 0,
		l = s.length,
		i = 0
	if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0

	return h.toString()
}
