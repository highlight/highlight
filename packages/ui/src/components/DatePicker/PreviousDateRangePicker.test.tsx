import { getLabel, Preset } from './PreviousDateRangePicker'
import { subtractDays, subtractHours } from './utils'

const now = new Date(1676410246855) // Feb 14 2023
const fourHoursAgo = subtractHours(now, 4)

const presets: Preset[] = [
	{
		label: 'Last 4 hours',
		startDate: fourHoursAgo,
	},
	{
		label: 'Last 12 hours',
		startDate: subtractHours(now, 12),
	},
	{
		label: 'Last 24 hours',
		startDate: subtractHours(now, 24),
	},
	{
		label: 'Last 3 days',
		startDate: subtractDays(now, 3),
	},
]

describe('getLabel', () => {
	it('finds the matching preset', async () => {
		const selectedDates = [fourHoursAgo, now]
		const label = getLabel({ selectedDates, presets })
		expect(label).toEqual('Last 4 hours')
	})

	it('handles when the preset does not match', async () => {
		const selectedDates = [subtractDays(now, 2), now]
		const label = getLabel({ selectedDates, presets })
		expect(label).toEqual('Feb 12, 09:30 PM - Feb 14, 09:30 PM')
	})

	it('includes the year when the the range spans to the next year', async () => {
		const selectedDates = [subtractDays(now, 60), now]
		const label = getLabel({ selectedDates, presets })
		expect(label).toEqual('Dec 16, 2022, 09:30 PM - Feb 14, 2023, 09:30 PM')
	})
})
