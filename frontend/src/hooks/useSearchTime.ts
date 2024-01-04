import {
	DatePickerSelectedValue,
	getNow,
	Preset,
	presetStartDate,
	presetValue,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	datePickerValue: DatePickerSelectedValue
	rebaseSearchTime: () => void
	updateSearchTime: (start?: Date, end?: Date, preset?: Preset) => void
}

type UseSearchTimeProps = {
	presets: Preset[]
	initialPreset?: Preset
}

export function useSearchTime({
	presets,
	initialPreset,
}: UseSearchTimeProps): UseSearchTimeReturnValue {
	const defaultPreset = initialPreset ?? presets[0]
	const [selectedPreset, setSelectedPreset] = useState<Preset | undefined>(
		defaultPreset,
	)
	const [endDate, setEndDate] = useState<Date>(getNow().toDate())
	const [startDate, setStartDate] = useState<Date>(
		moment(getNow())
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
	const [presetParam, setPresetParam] = useQueryParam<string | undefined>(
		'relative_time',
	)

	const updateSearchTime = (start?: Date, end?: Date, preset?: Preset) => {
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

	const rebaseSearchTime = () => {
		if (selectedPreset) {
			setStartDate(presetStartDate(selectedPreset))
			setEndDate(moment().toDate())
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
			setSelectedPreset(undefined)
			return
		}

		// use preset if provided
		if (presetParam) {
			const foundPreset = findPreset(presetParam)
			setSelectedPreset(foundPreset)
			setStartDate(presetStartDate(foundPreset))
			setEndDate(moment().toDate())
			return
		}

		// prevents searching while selecting dates
		if (!startDateParam && !endDateParam) {
			setStartDate(presetStartDate(defaultPreset))
			setEndDate(moment().toDate())
			setSelectedPreset(defaultPreset)
		}
	}, [
		presetParam,
		startDateParam,
		endDateParam,
		findPreset,
		setPresetParam,
		defaultPreset,
	])

	const datePickerValue = useMemo(() => {
		return {
			startDate: startDateParam ?? undefined,
			endDate: endDateParam ?? undefined,
			selectedPreset:
				presetParam || !(startDateParam || endDateParam)
					? selectedPreset
					: undefined,
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
