let rudderstackInitialized = false

export async function rudderInitialize() {
	if (rudderstackInitialized) {
		return
	}

	rudderstackInitialized = true

	window.rudderanalytics = await import('rudder-sdk-js')

	rudderanalytics.load(
		'2HMp4bSqggu0Z8W1cn6G5nydUxg',
		'https://highlightwjh.dataplane.rudderstack.com',
		{
			integrations: { All: true }, // load call options
		},
	)

	rudderanalytics.ready(() => {
		console.log('Rudderstack initialized!')
	})
}
