import { Metadata } from '@highlight-run/client'
import { H } from 'highlight.run'
import * as rudderanalytics from 'rudder-sdk-js'
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

const initialize = () => {
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
	;(window._hsq = window._hsq || []).push([
		'trackCustomBehavioralEvent',
		{
			name: event,
			properties: metadata,
		},
	])

	H.track(event, metadata as Metadata)
	rudderanalytics.track(event, omit(metadata, rudderstackReserved))
}

const identify = (email: string, traits?: rudderanalytics.apiObject) => {
	const hsq = (window._hsq = window._hsq || [])
	hsq.push([
		'identify',
		{
			email,
			...traits,
		},
	])
	hsq.push(['trackPageView'])

	H.identify(email, traits as Metadata)
	// `id` is a reserved keyword in rudderstack and it's recommended to use a
	// static property for the user ID rather than something that could change
	// over time, like an email address.
	rudderanalytics.identify(email, omit(traits, rudderstackReserved))
}

const page = (name: string, properties?: rudderanalytics.apiObject) => {
	rudderanalytics.page(name, omit(properties, rudderstackReserved))
}

const analytics = {
	initialize,
	track,
	identify,
	page,
}

export default analytics
