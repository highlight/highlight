import moment from 'moment'

import { DateRangePreset, DateRangeValue, presetLabel, presetValue } from '.'
import { TIME_DISPLAY_FORMAT, TIME_INPUT_FORMAT } from './constants'

export const formatDisplayedDate = (date?: Date) => {
	if (!date) {
		return ''
	}
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

export const getTimeStringFromDate = (
	date?: Date,
	endDate?: boolean,
): string => {
	if (!date) {
		return endDate ? '11:59pm' : '12:00 AM'
	}

	return moment(date).format(TIME_DISPLAY_FORMAT)
}

export const getTimeInfo = (timeString: string) => {
	const date = moment(timeString, TIME_INPUT_FORMAT)
	return {
		hour: date.format('HH'),
		minute: date.minute(),
		timeOfDay: date.format('a'),
		hour24: date.hour(),
	}
}

export const isPresetSelected = (
	preset: DateRangePreset,
	selectedPreset?: DateRangePreset,
) => {
	if (!selectedPreset) {
		return false
	}

	return presetValue(selectedPreset) === presetValue(preset)
}

export const isCustomSelected = ({
	presets,
	selectedValue,
}: {
	presets: DateRangePreset[]
	selectedValue: DateRangeValue
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected(preset, selectedValue.selectedPreset)
	})

	return !foundPreset
}

const toDateTimeString = (date: Date, showYear: boolean) => {
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}

	if (showYear) {
		options.year = 'numeric'
	}
	return date.toLocaleDateString('en-us', options)
}

export const setTimeOnDate = (date: Date, hour: number, minute: number) => {
	const newDate = new Date(date)

	newDate.setHours(hour)
	newDate.setMinutes(minute)

	return newDate
}

export const getInputLabel = ({
	selectedValue,
	presets,
}: {
	selectedValue: DateRangeValue
	presets: DateRangePreset[]
}) => {
	const foundPreset = presets.find((preset) => {
		return isPresetSelected(preset, selectedValue.selectedPreset)
	})

	if (foundPreset) {
		return presetLabel(foundPreset)
	}

	const { startDate, endDate } = selectedValue

	if (startDate && endDate) {
		const showYear = endDate.getFullYear() > startDate.getFullYear()

		return `${toDateTimeString(startDate, showYear)} - ${toDateTimeString(
			endDate,
			showYear,
		)}`
	}

	return ''
}
