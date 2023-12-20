import moment from 'moment'
import { Preset } from './PreviousDateRangePicker'

const subtractDays = (date: Date, days: number) => {
	const offset = 24 * 60 * 60 * 1000 * days
	return new Date(date.getTime() - offset)
}

const subtractHours = (date: Date, hours: number) => {
	const newDate = new Date(date.getTime())
	newDate.setHours(newDate.getHours() - hours)

	return newDate
}

export type TimePreset = {
	unit: moment.DurationInputArg2
	value: number
}

export const DEFAULT_TIME_PRESETS: TimePreset[] = [
	{
		unit: 'minutes',
		value: 15,
	},
	{
		unit: 'minutes',
		value: 60,
	},
	{
		unit: 'hours',
		value: 4,
	},
	{
		unit: 'hours',
		value: 24,
	},
	{
		unit: 'days',
		value: 7,
	},
	{
		unit: 'days',
		value: 30,
	},
]

let now = moment()
export const getNow = () => now.clone()
export let defaultPresets: Preset[] = []
export function resetRelativeDates() {
	now = moment()
	defaultPresets = DEFAULT_TIME_PRESETS.map(({ unit, value }) => ({
		label: `Last ${value} ${unit}`,
		startDate: getNow().subtract(value, unit).toDate(),
		unit: unit,
		value: value,
	}))
}
resetRelativeDates()

export { subtractDays, subtractHours }
