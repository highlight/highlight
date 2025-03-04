import { useSearchTime } from '@/hooks/useSearchTime'
import {
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
} from '@highlight-run/ui/components'
import { useEffect } from 'react'
import moment from 'moment'

const POLL_INTERVAL_VALUE = 1000 * 60
const LONGER_POLL_INTERVAL_VALUE = POLL_INTERVAL_VALUE * 5

export const useGraphTime = (presets: DateRangePreset[]) => {
	const {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	} = useSearchTime({
		presets: presets,
		initialPreset: DEFAULT_TIME_PRESETS[2],
	})

	useEffect(() => {
		// Only poll for new dates if a preset is selected
		if (!selectedPreset) {
			return
		}

		const dateDiff = moment(endDate).diff(startDate, 'seconds')
		const newPollInterval =
			dateDiff >= 4 * 3600
				? LONGER_POLL_INTERVAL_VALUE
				: POLL_INTERVAL_VALUE

		const updatePollingTime = () => {
			const newEndDate = new Date()
			const newStartDate = moment(newEndDate)
				.subtract(dateDiff, 'seconds')
				.toDate()
			updateSearchTime(newStartDate, newEndDate, selectedPreset)
		}

		const timeoutId = setTimeout(updatePollingTime, newPollInterval)
		return () => {
			clearTimeout(timeoutId)
		}
	}, [endDate, selectedPreset, startDate, updateSearchTime])

	return {
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
		rebaseSearchTime,
	}
}
