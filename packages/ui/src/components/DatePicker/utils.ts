import moment from 'moment'

const subtractDays = (date: Date, days: number) => {
	const offset = 24 * 60 * 60 * 1000 * days
	return new Date(date.getTime() - offset)
}

const subtractHours = (date: Date, hours: number) => {
	const newDate = new Date(date.getTime())
	newDate.setHours(newDate.getHours() - hours)

	return newDate
}

const now = moment()
export const getNow = () => now.clone()
export function getDefaultPresets() {
	return [
		{
			label: 'Last 15 minutes',
			startDate: getNow().subtract(15, 'minutes').toDate(),
		},
		{
			label: 'Last 60 minutes',
			startDate: getNow().subtract(60, 'minutes').toDate(),
		},
		{
			label: 'Last 4 hours',
			startDate: getNow().subtract(4, 'hours').toDate(),
		},
		{
			label: 'Last 24 hours',
			startDate: getNow().subtract(24, 'hours').toDate(),
		},
		{
			label: 'Last 7 days',
			startDate: getNow().subtract(7, 'days').toDate(),
		},
		{
			label: 'Last 30 days',
			startDate: getNow().subtract(30, 'days').toDate(),
		},
	]
}

export { subtractDays, subtractHours }
