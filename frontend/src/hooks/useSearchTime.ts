import {
	DateRangePreset,
	DateRangeValue,
	presetStartDate,
	presetValue,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	datePickerValue: DateRangeValue
	rebaseSearchTime: () => void
	updateSearchTime: (
		start?: Date,
		end?: Date,
		preset?: DateRangePreset,
	) => void
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
		start?: Date,
		end?: Date,
		preset?: DateRangePreset,
	) => {
		if (preset) {
			setPresetParam(presetValue(preset))
			setStartDateParam(undefined)
			setEndDateParam(undefined)
		} else {
			setPresetParam(undefined)
			setStartDateParam(start)
			setEndDateParam(end)
		}
	}

	const rebaseSearchTime = useCallback(() => {
		if (selectedPreset) {
			setStartDate(presetStartDate(selectedPreset))
			setEndDate(moment().toDate())
		}
	}, [selectedPreset])

	// keep state values in sync with query params
	useEffect(() => {
		// use preset if provided but don't overwrite times if matches last s
		if (presetParam) {
			if (selectedPreset && presetParam === presetValue(selectedPreset)) {
				return
			}

			const foundPreset = findPreset(presetParam)
			setSelectedPreset(foundPreset)
			setStartDate(presetStartDate(foundPreset))
			setEndDate(moment().toDate())
			return
		}

		// avoid setting until both params are set
		if (startDateParam && endDateParam) {
			setStartDate(startDateParam as Date)
			setEndDate(endDateParam as Date)
			setSelectedPreset(undefined)
			return
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [presetParam, startDateParam, endDateParam])

	const datePickerValue = useMemo(() => {
		const usePreset = presetParam || !startDateParam || !endDateParam

		return {
			startDate: startDateParam ?? undefined,
			endDate: endDateParam ?? undefined,
			selectedPreset: usePreset ? selectedPreset : undefined,
		}
	}, [endDateParam, presetParam, selectedPreset, startDateParam])

	return {
		startDate,
		endDate,
		datePickerValue,
		rebaseSearchTime,
		updateSearchTime,
	}
}
