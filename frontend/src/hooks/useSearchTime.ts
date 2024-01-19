import {
	DateRangePreset,
	presetStartDate,
	presetValue,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
	rebaseSearchTime: () => void
	updateSearchTime: (start: Date, end: Date, preset?: DateRangePreset) => void
	resetSearchTime: () => void
}

type UseSearchTimeProps = {
	presets: DateRangePreset[]
	initialPreset?: DateRangePreset
}

export function useSearchTime({
	presets,
	initialPreset,
}: UseSearchTimeProps): UseSearchTimeReturnValue {
	const defaultPreset = initialPreset ?? presets[0]
	const [startDateParam, setStartDateParam] = useQueryParam(
		'start_date',
		DateTimeParam,
	)
	const [endDateParam, setEndDateParam] = useQueryParam(
		'end_date',
		DateTimeParam,
	)
	const [presetParam, setPresetParam] = useQueryParam<string | undefined>(
		'relative_time',
	)

	const findPreset = useCallback(
		(value?: string): DateRangePreset => {
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

	// initalize state to url params
	const useRelativeTime = presetParam || !startDateParam || !endDateParam
	const [selectedPreset, setSelectedPreset] = useState<
		DateRangePreset | undefined
	>(useRelativeTime ? findPreset(presetParam) : undefined)

	const [endDate, setEndDate] = useState<Date>(
		useRelativeTime ? moment().toDate() : new Date(endDateParam!),
	)
	const [startDate, setStartDate] = useState<Date>(
		useRelativeTime
			? presetStartDate(selectedPreset ?? defaultPreset)
			: new Date(startDateParam!),
	)

	const updateSearchTime = (
		start: Date,
		end: Date,
		preset?: DateRangePreset,
	) => {
		setStartDate(start)
		setEndDate(end)
		setSelectedPreset(preset)
	}

	const resetSearchTime = () => {
		const start = presetStartDate(defaultPreset)
		const end = moment().toDate()
		updateSearchTime(start, end, defaultPreset)
	}

	const rebaseSearchTime = useCallback(() => {
		if (selectedPreset) {
			setStartDate(presetStartDate(selectedPreset))
			setEndDate(moment().toDate())
		}
	}, [selectedPreset])

	// keep url values in sync with query params
	useEffect(() => {
		if (selectedPreset) {
			let selectedPresetValue: string | undefined =
				presetValue(selectedPreset)
			if (selectedPresetValue === presetValue(defaultPreset)) {
				selectedPresetValue = undefined
			}

			setPresetParam(selectedPresetValue)
			setEndDateParam(undefined)
			setStartDateParam(undefined)
		} else {
			setPresetParam(undefined)
			setEndDateParam(endDate)
			setStartDateParam(startDate)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startDate, endDate, selectedPreset])

	return {
		startDate,
		endDate,
		selectedPreset,
		rebaseSearchTime,
		updateSearchTime,
		resetSearchTime,
	}
}
