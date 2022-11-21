import * as rudderanalytics from 'rudder-sdk-js'

let rudderstackInitialized = false

export const initialize = () => {
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

export const identify = rudderanalytics.identify
export const track = rudderanalytics.track
export const page = rudderanalytics.page
