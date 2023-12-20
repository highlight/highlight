import { DEFAULT_TIME_PRESETS, TimePreset } from '@highlight-run/ui/components'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate?: Date
	endDate?: Date
	relativeTimePreset?: TimePreset
	updateSearchTime: (
		start?: Date,
		end?: Date,
		relativeTimePreset?: TimePreset,
	) => void
}

export function useSearchTime(): UseSearchTimeReturnValue {
	const [relativeTimePreset, setRelativeTimePreset] = useState<TimePreset>()
	const [startDate, setStartDate] = useState<Date>()
	const [endDate, setEndDate] = useState<Date>()

	const [startDateParam, setStartDateParam] = useQueryParam(
		'start_date',
		DateTimeParam,
	)
	const [endDateParam, setEndDateParam] = useQueryParam(
		'end_date',
		DateTimeParam,
	)
	const [relativeTime, setRelativeTime] = useQueryParam<string | undefined>(
		'relative_time',
	)

	const updateSearchTime = (
		start?: Date,
		end?: Date,
		relativeTimePreset?: TimePreset,
	) => {
		if (validPreset(relativeTimePreset)) {
			const presetString = `${relativeTimePreset!.value}_${
				relativeTimePreset!.unit
			}`
			setRelativeTime(presetString)
			setStartDateParam(undefined)
			setEndDateParam(undefined)
		} else {
			setRelativeTime(undefined)
			setStartDateParam(start)
			setEndDateParam(end)
		}
	}

	// keep state values in sync with query params
	useEffect(() => {
		// ue absolute time if both provided
		if (startDateParam && endDateParam) {
			setRelativeTimePreset(undefined)
			setStartDate(startDateParam as Date)
			setEndDate(endDateParam as Date)
			return
		}

		// default to relative time
		// if no params provided use 15 minutes
		// TODO(spenny): allow customization of default time preset
		let timePreset = DEFAULT_TIME_PRESETS[0]
		let relativeStartDate = moment()
			.subtract(timePreset.value, timePreset.unit)
			.toDate()
		const relativeEndDate = moment().toDate()

		if (relativeTime) {
			const preset = buildPreset(relativeTime as string)
			if (validPreset(preset)) {
				timePreset = preset!
				relativeStartDate = moment()
					.subtract(preset!.value, preset!.unit)
					.toDate()
			}
		}

		setRelativeTimePreset(timePreset)
		setStartDate(relativeStartDate)
		setEndDate(relativeEndDate)
	}, [relativeTime, startDateParam, endDateParam])

	return { startDate, endDate, relativeTimePreset, updateSearchTime }
}

const validPreset = (preset?: TimePreset) => {
	if (!preset) return false

	return DEFAULT_TIME_PRESETS.some(
		(defaultPreset) =>
			defaultPreset.unit === preset.unit &&
			defaultPreset.value === preset.value,
	)
}

const buildPreset = (presetString?: string) => {
	if (!presetString) return undefined

	const [value, unit] = presetString.split('_')

	return { unit, value: Number(value) } as TimePreset
}
