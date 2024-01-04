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

const presetStartDate = (preset: Preset): Date => {
	return moment().subtract(preset.quantity, preset.unit).toDate()
}

export const DEFAULT_TIME_PRESETS: Preset[] = [
	{
		unit: 'minutes',
		quantity: 15,
	},
	{
		unit: 'minutes',
		quantity: 60,
	},
	{
		unit: 'hours',
		quantity: 4,
	},
	{
		unit: 'hours',
		quantity: 24,
	},
	{
		unit: 'days',
		quantity: 7,
	},
	{
		unit: 'days',
		quantity: 30,
	},
]

let now = moment()
export const getNow = () => now.clone()
export let defaultPresets: Preset[] = []
export function resetRelativeDates() {
	now = moment()
	defaultPresets = DEFAULT_TIME_PRESETS
}
resetRelativeDates()

export { subtractDays, subtractHours, presetStartDate }
