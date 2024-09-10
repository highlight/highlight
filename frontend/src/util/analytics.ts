import { Metadata } from '@highlight-run/client'
import { H } from 'highlight.run'
import * as rudderanalytics from 'rudder-sdk-js'

import { DISABLE_ANALYTICS } from '@/constants'
import { omit } from 'lodash'

// from https://www.rudderstack.com/docs/archive/javascript-sdk/1.1/faq/#what-is-the-reserved-keyword-error
const rudderstackReserved = [
	'anonymous_id',
	'id',
	'sent_at',
	'received_at',
	'timestamp',
	'original_timestamp',
	'event_text',
	'event',
]
let rudderstackInitialized = false

// necessary to ensure DISABLE_ANALYTICS value is not removed from constants.ts by tree-shaking
const isDisabled = DISABLE_ANALYTICS === 'true'
console.debug(`highlight analytics`, { DISABLE_ANALYTICS, isDisabled })

const initialize = () => {
	if (isDisabled) {
		console.debug(`highlight analytics disabled`)
		return
	}

	if (rudderstackInitialized) {
		console.warn('Rudderstack already initialized.')
		return
	}

	rudderstackInitialized = true

	rudderanalytics.load(
		'2HMp4bSqggu0Z8W1cn6G5nydUxg',
		'https://highlightwjh.dataplane.rudderstack.com',
		{ integrations: { All: true } },
	)
}

const track = (event: string, metadata?: rudderanalytics.apiObject) => {
	H.track(event, metadata as Metadata)

	if (isDisabled) {
		console.debug(`highlight analytics disabled`)
		return
	}

	;(window._hsq = window._hsq || []).push([
		'trackCustomBehavioralEvent',
		{
			name: event,
			properties: metadata,
		},
	])

	rudderanalytics.track(event, omit(metadata, rudderstackReserved))
}

const identify = (email: string, traits?: rudderanalytics.apiObject) => {
	H.identify(email, traits as Metadata)

	if (isDisabled) {
		console.debug(`highlight analytics disabled`)
		return
	}

	const hsq = (window._hsq = window._hsq || [])
	hsq.push([
		'identify',
		{
			email,
			...traits,
		},
	])
	hsq.push(['trackPageView'])

	// `id` is a reserved keyword in rudderstack and it's recommended to use a
	// static property for the user ID rather than something that could change
	// over time, like an email address.
	rudderanalytics.identify(email, omit(traits, rudderstackReserved))
}

const page = (name: string, properties?: rudderanalytics.apiObject) => {
	if (isDisabled) {
		console.debug(`highlight analytics disabled`)
		return
	}

	rudderanalytics.page(name, omit(properties, rudderstackReserved))
}

const trackGaEvent = (event: string, properties?: Record<string, any>) => {
	if (window.dataLayer) {
		window.dataLayer.push({
			event,
			...properties,
		})
	}
}

const analytics = {
	initialize,
	track,
	identify,
	page,
	trackGaEvent,
}

export default analytics
