import { Preset } from '@highlight-run/ui/components'
import moment from 'moment'

const now = moment().startOf('day')

const last30Days: Preset = {
	quantity: 30,
	unit: 'days',
}

const PRESETS: Preset[] = [
	{
		quantity: 60,
		unit: 'minutes',
	},
	{
		quantity: 24,
		unit: 'hours',
	},
	{
		quantity: 7,
		unit: 'days',
	},
	last30Days,
	{
		quantity: 90,
		unit: 'days',
	},
	{
		quantity: 1,
		unit: 'year',
		label: 'Last year',
	},
]

export { last30Days, now, PRESETS }
