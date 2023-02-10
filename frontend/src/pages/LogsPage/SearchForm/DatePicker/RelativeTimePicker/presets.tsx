import moment from 'moment'

const now = moment()

export type Preset = {
	startDate: Date
	endDate: Date
	label: string
}

export const PRESETS: { [key: string]: Preset } = {
	last_15_minutes: {
		startDate: now.clone().subtract(15, 'minutes').toDate(),
		endDate: now.toDate(),
		label: 'Last 15 minutes',
	},
	last_60_minutes: {
		startDate: now.clone().subtract(60, 'minutes').toDate(),
		endDate: now.toDate(),
		label: 'Last 60 minutes',
	},
	last_4_hours: {
		startDate: now.clone().subtract(4, 'hours').toDate(),
		endDate: now.toDate(),
		label: 'Last 4 hours',
	},
	last_24_hours: {
		startDate: now.clone().subtract(24, 'hours').toDate(),
		endDate: now.toDate(),
		label: 'Last 24 hours',
	},
	last_7_days: {
		startDate: now.clone().subtract(7, 'days').toDate(),
		endDate: now.toDate(),
		label: 'Last 7 days',
	},
	last_30_days: {
		startDate: now.clone().subtract(30, 'days').toDate(),
		endDate: now.toDate(),
		label: 'Last 30 days',
	},
}
