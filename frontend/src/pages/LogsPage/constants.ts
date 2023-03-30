import { LogLevel } from '@graph/schemas'
import { Preset } from '@highlight-run/ui'
import moment from 'moment'

export const FORMAT = 'YYYY-MM-DDTHH:mm:ss.000000000Z'

export const now = moment()
export const fifteenMinutesAgo = now.clone().subtract(15, 'minutes').toDate()
export const thirtyDaysAgo = now.clone().subtract(30, 'days').toDate()
export const PRESETS: Preset[] = [
	{
		startDate: fifteenMinutesAgo,
		label: 'Last 15 minutes',
	},
	{
		startDate: now.clone().subtract(60, 'minutes').toDate(),
		label: 'Last 60 minutes',
	},
	{
		startDate: now.clone().subtract(4, 'hours').toDate(),
		label: 'Last 4 hours',
	},
	{
		startDate: now.clone().subtract(24, 'hours').toDate(),
		label: 'Last 24 hours',
	},
	{
		startDate: now.clone().subtract(7, 'days').toDate(),
		label: 'Last 7 days',
	},
	{
		startDate: thirtyDaysAgo,
		label: 'Last 30 days',
	},
]

export const COLOR_MAPPING: {
	[key in LogLevel]: string
} = {
	// Custom colors from Figma.
	[LogLevel.Warn]: '#FFB224',
	[LogLevel.Debug]: '#6F6E77',
	[LogLevel.Info]: '#744ED4',
	[LogLevel.Error]: '#E5484D',
	[LogLevel.Fatal]: '#CD2B31',
	[LogLevel.Trace]: '#1a1523',
}

export type TIME_MODE = 'fixed-range' | 'permalink'
