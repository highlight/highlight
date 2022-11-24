import { Metadata } from '@highlight-run/client'
import { H } from 'highlight.run'
import * as rudderanalytics from 'rudder-sdk-js'

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
	H.track(event, metadata as Metadata)
	rudderanalytics.track(event, metadata)
}

const analytics = {
	initialize,
	track,
	identify: rudderanalytics.identify,
	page: rudderanalytics.page,
}

export default analytics
