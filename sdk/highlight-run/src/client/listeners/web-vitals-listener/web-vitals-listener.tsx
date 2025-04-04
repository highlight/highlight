import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'

export const WebVitalsListener = (callback: (metric: Metric) => void) => {
	onCLS(callback)
	onFCP(callback)
	onFID(callback)
	onLCP(callback)
	onTTFB(callback)
	onINP(callback)

	return () => {}
}
