import moment from 'moment'
import { useEffect, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	relativeTimePreset?: string
	updateSearchTime: (
		start?: Date,
		end?: Date,
		relativeTimePreset?: string,
	) => void
}

export function useSearchTime(): UseSearchTimeReturnValue {
	const [startDate, setStartDate] = useState<Date>(new Date())
	const [endDate, setEndDate] = useState<Date>(new Date())

	const [startDateParam, setStartDateParam] = useQueryParam(
		'start_date',
		DateTimeParam,
	)
	const [endDateParam, setEndDateParam] = useQueryParam(
		'end_date',
		DateTimeParam,
	)
	const [relativeTimePreset, setRelativeTimePreset] = useQueryParam<
		string | undefined
	>('relative_time')

	const updateSearchTime = (
		start?: Date,
		end?: Date,
		relativeTime?: string,
	) => {
		if (relativeTime) {
			setRelativeTimePreset(relativeTime)
			setStartDateParam(undefined)
			setEndDateParam(undefined)
		} else {
			setRelativeTimePreset(undefined)
			setStartDateParam(start)
			setEndDateParam(end)
		}
	}

	// keep state values in sync with query params
	useEffect(() => {
		// use absolute time if both provided
		if (startDateParam && endDateParam) {
			setStartDate(startDateParam as Date)
			setEndDate(endDateParam as Date)
			return
		}

		// default to relative time
		const { quantity, unit } = translateTimePreset(relativeTimePreset)
		const relativeStartDate = moment().subtract(quantity, unit).toDate()
		const relativeEndDate = moment().toDate()

		setStartDate(relativeStartDate)
		setEndDate(relativeEndDate)
	}, [relativeTimePreset, startDateParam, endDateParam])

	return { startDate, endDate, relativeTimePreset, updateSearchTime }
}

type RelativeTimeAttributes = {
	quantity: number
	unit: moment.unitOfTime.DurationConstructor
}

const translateTimePreset = (preset?: string): RelativeTimeAttributes => {
	// TODO(spenny): what should be the default?
	if (!preset) return { quantity: 15, unit: 'minutes' }

	// preset is in format "last_quantity_unit" (e.g. "last_15_minutes")
	const [quantity, unit] = preset.split('_').slice(1)
	return {
		quantity: parseInt(quantity),
		unit: unit as moment.unitOfTime.DurationConstructor,
	}
}
