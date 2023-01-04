import Cookies from 'js-cookie'

export const setAttributionData = () => {
	const urlParams = new URLSearchParams(location.search)
	const campaign = urlParams.get('utm_campaign')
	const source = urlParams.get('utm_source')
	const medium = urlParams.get('utm_medium')
	const referrer = document.referrer

	if (campaign) {
		Cookies.set('campaign', campaign)
	}

	if (source) {
		Cookies.set('source', source)
	}

	if (medium) {
		Cookies.set('medium', medium)
	}

	if (referrer) {
		Cookies.set('referrer', referrer)
	}
}

export const getAttributionData = () => {
	const campaign = Cookies.get('campaign')
	const source = Cookies.get('source')
	const medium = Cookies.get('medium')
	const referrer = Cookies.get('referrer')

	return { campaign, medium, source, referrer }
}
