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

const analytics = {
	initialize,
	identify: rudderanalytics.identify,
	track: rudderanalytics.track,
	page: rudderanalytics.page,
}

export default analytics
