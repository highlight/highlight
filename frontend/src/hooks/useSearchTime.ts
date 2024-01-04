import { Preset, presetValue } from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	selectedPreset?: Preset
	updateSearchTime: (start?: Date, end?: Date, preset?: Preset) => void
}

const now = moment()

type UseSearchTimeProps = {
	presets: Preset[]
	onDatesChange?: (start: Date, end: Date) => void
}

export function useSearchTime({
	presets,
	onDatesChange,
}: UseSearchTimeProps): UseSearchTimeReturnValue {
	const defaultPreset = presets[0]
	const [selectedPreset, setSelectedPreset] = useState<Preset>(defaultPreset)
	const [endDate, setEndDate] = useState<Date>(now.toDate())
	const [startDate, setStartDate] = useState<Date>(
		moment(now)
			.subtract(defaultPreset.quantity, defaultPreset.unit)
			.toDate(),
	)

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

	const updateSearchTime = (start?: Date, end?: Date, preset?: Preset) => {
		if (preset) {
			setRelativeTimePreset(presetValue(preset))
			setStartDateParam(undefined)
			setEndDateParam(undefined)
		} else {
			setRelativeTimePreset(undefined)
			setStartDateParam(start)
			setEndDateParam(end)
		}
	}

	const findPreset = useCallback(
		(value?: string): Preset => {
			if (!value) {
				return defaultPreset
			}

			const foundPreset = presets.find(
				(preset) => presetValue(preset) === value,
			)

			return foundPreset || defaultPreset
		},
		[defaultPreset, presets],
	)

	// keep state values in sync with query params
	useEffect(() => {
		// use absolute time if both provided
		if (startDateParam && endDateParam) {
			setStartDate(startDateParam as Date)
			setEndDate(endDateParam as Date)
			setRelativeTimePreset(undefined)
			return
		}

		// default to relative time
		const foundPreset = findPreset(relativeTimePreset)
		const relativeStartDate = moment()
			.subtract(foundPreset.quantity, foundPreset.unit)
			.toDate()
		const relativeEndDate = moment().toDate()

		setSelectedPreset(foundPreset)
		setStartDate(relativeStartDate)
		setEndDate(relativeEndDate)
	}, [
		relativeTimePreset,
		startDateParam,
		endDateParam,
		findPreset,
		setRelativeTimePreset,
	])

	useEffect(() => {
		if (onDatesChange) {
			onDatesChange(startDate, endDate)
		}
	}, [onDatesChange, startDate, endDate])

	return { startDate, endDate, selectedPreset, updateSearchTime }
}
