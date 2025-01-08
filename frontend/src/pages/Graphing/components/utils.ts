import { isNumber } from 'lodash'

export const syncTimestamp = (ticks: any[], activePoint: any) => {
	{
		const activeTimestamp = activePoint?.activeLabel
		if (!activeTimestamp || !isNumber(activeTimestamp)) {
			return
		}

		let closestTick = ticks?.[0]
		ticks?.forEach((tick: any) => {
			if (
				Math.abs(tick.value - activeTimestamp) <
				Math.abs(closestTick.value - activeTimestamp)
			) {
				closestTick = tick
			}
		})

		return closestTick?.index
	}
}
