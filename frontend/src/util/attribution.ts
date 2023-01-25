import Cookies from 'js-cookie'

export const setAttributionData = () => {
	const urlParams = new URLSearchParams(window.location.search)
	const referrer = urlParams.get('ref') || document.referrer
	const originalReferrer = Cookies.get('referrer')

	if (referrer && !originalReferrer) {
		Cookies.set('referrer', referrer, { domain: 'highlight.io' })
	}
}

export const getAttributionData = () => {
	const referrer = Cookies.get('referrer') || ''

	return {
		// Stored as "referral" in our DB
		referral: referrer,
	}
}
