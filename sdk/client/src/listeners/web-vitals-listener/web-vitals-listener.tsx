import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals'

interface Metric {
	name: string
	value: number
}

export const WebVitalsListener = (callback: (metric: Metric) => void) => {
	onCLS(callback)
	onFCP(callback)
	onFID(callback)
	onLCP(callback)
	onTTFB(callback)
	onINP(callback)

	return () => {}
}
