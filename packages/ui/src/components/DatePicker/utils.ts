import { Moment } from "moment"

const subtractDays = (date: Date, days: number) => {
	const offset = 24 * 60 * 60 * 1000 * days
	return new Date(date.getTime() - offset)
}

const subtractHours = (date: Date, hours: number) => {
	const newDate = new Date(date.getTime())
	newDate.setHours(newDate.getHours() - hours)

	return newDate
}

export function getDefaultPresets(now: Moment) {
	return [
		{
			label: 'Last 15 minutes',
			startDate: now.clone().subtract(15, 'minutes').toDate(),
		},
		{
			label: 'Last 60 minutes',
			startDate: now.clone().subtract(60, 'minutes').toDate(),
		},
		{
			label: 'Last 4 hours',
			startDate: now.clone().subtract(4, 'hours').toDate(),
		},
		{
			label: 'Last 24 hours',
			startDate: now.clone().subtract(24, 'hours').toDate(),
		},
		{
			label: 'Last 7 days',
			startDate: now.clone().subtract(7, 'days').toDate(),
		},
		{
			label: 'Last 30 days',
			startDate: now.clone().subtract(30, 'days').toDate(),
		},
	]
}

export { subtractDays, subtractHours }
