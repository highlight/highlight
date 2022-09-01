interface Metric {
	name: string
	value: number
}

export const WebVitalsListener = (callback: (metric: Metric) => void) => {
	;(function () {
		var script = document.createElement('script')
		script.src = 'https://unpkg.com/web-vitals/dist/web-vitals.iife.js'
		script.onload = function () {
			window?.webVitals?.getCLS(callback)
			window?.webVitals?.getFCP(callback)
			window?.webVitals?.getFID(callback)
			window?.webVitals?.getLCP(callback)
			window?.webVitals?.getTTFB(callback)
		}
		document.head.appendChild(script)
	})()

	return () => {}
}

// eslint-disable-next-line no-unused-vars
interface Window {
	webVitals?: any
}

declare var window: Window
