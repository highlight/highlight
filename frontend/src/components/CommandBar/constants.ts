import moment from 'moment'

const now = moment().startOf('day')

const last30Days = {
	startDate: now.clone().subtract(30, 'days').toDate(),
	label: 'Last 30 days',
}

const PRESETS = [
	{
		startDate: now.clone().subtract(60, 'minutes').toDate(),
		label: 'Last 60 minutes',
	},
	{
		startDate: now.clone().subtract(24, 'hours').toDate(),
		label: 'Last 24 hours',
	},
	{
		startDate: now.clone().subtract(7, 'days').toDate(),
		label: 'Last 7 days',
	},
	last30Days,
	{
		startDate: now.clone().subtract(90, 'days').toDate(),
		label: 'Last 90 days',
	},
	{
		startDate: now.clone().subtract(1, 'y').toDate(),
		label: 'Last year',
	},
]

export { last30Days, now, PRESETS }
