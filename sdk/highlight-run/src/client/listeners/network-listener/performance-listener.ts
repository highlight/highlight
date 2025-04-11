type NetworkInformation = {
	downlink: number
	downlinkMax: number
	rtt: number
	saveData: boolean
	effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
	type:
		| 'bluetooth'
		| 'cellular'
		| 'ethernet'
		| 'none'
		| 'wifi'
		| 'wimax'
		| 'other'
		| 'unknown'
}

export type NetworkPerformancePayload = Partial<NetworkInformation> & {
	/** Timestamp relative to the current session. If a measurement was taking 5 seconds into the session, then the timestamp will be 5. */
	relativeTimestamp: number
}

const conn: NetworkInformation =
	typeof navigator !== 'undefined' && 'connection' in navigator
		? (navigator.connection as any)
		: {}

export const NetworkPerformanceListener = (
	callback: (payload: NetworkPerformancePayload) => void,
	recordingStartTime: number,
) => {
	const worker = () => {
		const now = new Date().getTime()
		const relativeTimestamp = (now - recordingStartTime) / 1000
		callback({
			relativeTimestamp,
			downlink: conn.downlink,
			downlinkMax: conn.downlinkMax,
			effectiveType: conn.effectiveType,
			rtt: conn.rtt,
			saveData: conn.saveData,
			type: conn.type,
		})
	}

	worker()

	let intervalId: number | undefined = undefined
	intervalId = setInterval(() => {
		worker()
	}, 1000) as unknown as number

	return () => {
		clearInterval(intervalId)
	}
}
