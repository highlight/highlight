import { GenerateSecureID } from '@highlight-run/client/src/utils/secure-id'
import { H } from 'highlight.run'
import Cookies from 'js-cookie'

export const setAttributionData = () => {
	const urlParams = new URLSearchParams(window.location.search)
	const referrer = urlParams.get('ref') || document.referrer
	const originalReferrer = Cookies.get('referrer')

	if (referrer && !originalReferrer) {
		Cookies.set('referrer', referrer, {
			domain: 'highlight.io',
			expires: 365,
		})
	}
}

export const getAttributionData = () => {
	let clientID = window.localStorage.getItem('highlightClientID')
	if (!clientID) {
		clientID = GenerateSecureID()
		window.localStorage.setItem('highlightClientID', clientID)
	}

	const referrer = Cookies.get('referrer') || ''

	return {
		// Stored as "referral" in our DB
		referral: referrer,
		// use clientID to deduplicate attribution
		clientID,
	}
}

export const recordStorageEvents = () => {
	window.addEventListener(
		'storage',
		(e: StorageEvent) => {
			const details: any = {
				storageArea: e.storageArea,
				key: e.key,
				newValue: e.newValue,
				oldValue: e.oldValue,
				url: e.url,
			}
			H.track('storage')
			H.startSpan('storage', { attributes: details }, () => {})
		},
		false,
	)
}
