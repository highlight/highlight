import Cookies from 'js-cookie'

import { GenerateSecureID } from '../../../sdk/client/src/utils/secure-id'

export const setAttributionData = () => {
	const urlParams = new URLSearchParams(window.location.search)
	const referrer = urlParams.get('ref') || document.referrer
	const originalReferrer = Cookies.get('referrer')

	if (referrer && !originalReferrer) {
		Cookies.set('referrer', referrer, { domain: 'highlight.io' })
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
