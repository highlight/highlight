interface PerformanceMethods {
	/**
	 * Returns data that doesn't change during the session.
	 */
	getDeviceDetails?: () => {
		deviceMemory: number
	}
	/**
	 * Returns data that can change during the session.
	 */
	getCurrentDeviceDetails?: () => {
		jsHeapSizeLimit: number
		totalJSHeapSize: number
		usedJSHeapSize: number
	}
}

export const getPerformanceMethods = (): PerformanceMethods => {
	// Some browsers don't support the performance API.
	if (!('performance' in window && 'memory' in performance)) {
		return {
			getDeviceDetails: undefined,
			getCurrentDeviceDetails: undefined,
		}
	}

	const performanceAPI = window.performance as any

	const getDeviceDetails = () => {
		/**
		 * How much RAM that device has.
		 */
		const deviceMemory = gigabytesToMegabytes(
			(navigator as any).deviceMemory || 0,
		)

		return {
			deviceMemory,
		}
	}

	const getCurrentDeviceDetails = () => {
		/**
		 * The amount of memory that the OS/browser allows the tab to ask for.
		 */
		const jsHeapSizeLimit = bytesToMegabytes(
			performanceAPI.memory.jsHeapSizeLimit,
		)
		/**
		 * The total amount of memory the tab as allocated.
		 */
		const totalJSHeapSize = bytesToMegabytes(
			performanceAPI.memory.totalJSHeapSize,
		)
		/**
		 * The total amount of memory actually used.
		 *
		 * Heap Size Limit: The max amount of memory that can be allocated.
		 * Allocated memory: Memory that the tab can use.
		 */
		const usedJSHeapSize = bytesToMegabytes(
			performanceAPI.memory.usedJSHeapSize,
		)

		return {
			jsHeapSizeLimit,
			totalJSHeapSize,
			usedJSHeapSize,
		}
	}

	return {
		getDeviceDetails,
		getCurrentDeviceDetails,
	}
}

const bytesToMegabytes = (bytes: number) => {
	return bytes / Math.pow(1000, 2)
}

const gigabytesToMegabytes = (gigabytes: number) => {
	return 1024 * gigabytes
}
