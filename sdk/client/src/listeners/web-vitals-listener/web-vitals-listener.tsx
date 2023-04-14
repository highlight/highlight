import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals'

export const WebVitalsListener = (callback: (metric: Metric) => void) => {
	onCLS(callback)
	onFCP(callback)
	onFID(callback)
	onLCP(callback)
	onTTFB(callback)
	onINP(callback)

	return () => {}
}
