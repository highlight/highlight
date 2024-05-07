import {
	DateRangePreset,
	presetStartDate,
	presetValue,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { DateTimeParam, StringParam, useQueryParams } from 'use-query-params'

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
	const [params, setParams] = useQueryParams({
		relative_time: StringParam,
		start_date: DateTimeParam,
		end_date: DateTimeParam,
	})

	const findPreset = useCallback(
		(value?: string | null): DateRangePreset => {
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
	const useRelativeTime =
		params.relative_time || !params.start_date || !params.end_date
	const [selectedPreset, setSelectedPreset] = useState<
		DateRangePreset | undefined
	>(useRelativeTime ? findPreset(params.relative_time) : undefined)

	const [endDate, setEndDate] = useState<Date>(
		useRelativeTime ? moment().toDate() : new Date(params.end_date!),
	)
	const [startDate, setStartDate] = useState<Date>(
		useRelativeTime
			? presetStartDate(selectedPreset ?? defaultPreset)
			: new Date(params.start_date!),
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

			setParams(
				{
					relative_time: selectedPresetValue,
					start_date: undefined,
					end_date: undefined,
				},
				'replaceIn',
			)
		} else {
			setParams(
				{
					relative_time: undefined,
					start_date: startDate,
					end_date: endDate,
				},
				'replaceIn',
			)
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
