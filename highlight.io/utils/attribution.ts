import { GenerateSecureID } from '@highlight-run/client'
import Cookies from 'js-cookie'

interface Referrer {
	clientID: string
	utm_source?: string | null
	utm_medium?: string | null
	utm_campaign?: string | null
	utm_content?: string | null
	utm_term?: string | null
	device?: string | null
	gclid?: string | null
	referrer?: string | null
	pathReferrer?: string | null
	documentReferrer: string
}

// Same as what we have in frontend. Need to keep these in sync.
export const setAttributionData = () => {
	let clientID = window.localStorage.getItem('highlightClientID')

	if (!clientID) {
		clientID = GenerateSecureID()
		window.localStorage.setItem('highlightClientID', clientID)
	}
	let referrer: Referrer = {
		clientID,
		documentReferrer: document.referrer,
	}
	const prevRef = Cookies.get('referrer')
	if (prevRef) {
		referrer = { ...referrer, ...(JSON.parse(prevRef) as Referrer) }
	}
	referrer.documentReferrer = document.referrer

	const urlParams = new URLSearchParams(window.location.search)
	if (urlParams.get('ref')) {
		referrer = { ...referrer, referrer: urlParams.get('ref') }
	}
	if (urlParams.get('utm_source')) {
		referrer = {
			...referrer,
			utm_source: urlParams.get('utm_source'),
			utm_medium: urlParams.get('utm_medium'),
			utm_campaign: urlParams.get('utm_campaign'),
			utm_content: urlParams.get('utm_content'),
			utm_term: urlParams.get('utm_term'),
			device: urlParams.get('device'),
			gclid: urlParams.get('gclid'),
		}
	}

	const pathRef =
		window.location.pathname.indexOf('/r/') === -1
			? undefined
			: window.location.pathname.split('/r/').pop()
	if (pathRef) {
		referrer = { ...referrer, pathReferrer: pathRef }
	}

	Cookies.set('referrer', JSON.stringify(referrer), {
		domain: 'highlight.io',
	})

	return referrer
}
