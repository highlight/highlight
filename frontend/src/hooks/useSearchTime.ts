import {
	DatePickerSelectedValue,
	getNow,
	Preset,
	presetValue,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateTimeParam, useQueryParam } from 'use-query-params'

export interface UseSearchTimeReturnValue {
	startDate: Date
	endDate: Date
	datePickerValue: DatePickerSelectedValue
	updateSearchTime: (start?: Date, end?: Date, preset?: Preset) => void
}

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
		if (startDateParam || endDateParam) {
			if (startDateParam) {
				setStartDate(startDateParam as Date)
			}
			if (endDateParam) {
				setEndDate(endDateParam as Date)
			}
			setPresetParam(undefined)
			return
		}

		// default to relative time
		const foundPreset = findPreset(presetParam)
		const relativeStartDate = moment()
			.subtract(foundPreset.quantity, foundPreset.unit)
			.toDate()
		const relativeEndDate = moment().toDate()

		setSelectedPreset(foundPreset)
		setStartDate(relativeStartDate)
		setEndDate(relativeEndDate)
	}, [presetParam, startDateParam, endDateParam, findPreset, setPresetParam])

	useEffect(() => {
		if (onDatesChange) {
			onDatesChange(startDate, endDate)
		}
	}, [onDatesChange, startDate, endDate])

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
		updateSearchTime,
	}
}
