import { Preset, getLabel } from './PreviousDateRangePicker'
import { subtractDays, subtractHours } from './utils'

const now = new Date(1676410246855) // Feb 14 2023
const fourHoursAgo = subtractHours(now, 4)

const presets: Preset[] = [
	{
		quantity: 4,
		unit: 'hours',
	},
	{
		quantity: 12,
		unit: 'hours',
	},
	{
		quantity: 24,
		unit: 'hours',
	},
	{
		quantity: 3,
		unit: 'days',
	},
]

// TODO(spenny): add relevant tests
describe('getLabel', () => {
	it('finds the matching preset', async () => {
		const selectedValue = { startDate: fourHoursAgo, endDate: now }
		const label = getLabel({ selectedValue, presets })
		expect(label).toEqual('Last 4 hours')
	})

	it('handles when the preset does not match', async () => {
		const selectedValue = { startDate: subtractDays(now, 2), endDate: now }
		const label = getLabel({ selectedValue, presets })
		expect(label).toEqual('Feb 12, 09:30 PM - Feb 14, 09:30 PM')
	})

	it('includes the year when the the range spans to the next year', async () => {
		const selectedValue = { startDate: subtractDays(now, 60), endDate: now }
		const label = getLabel({ selectedValue, presets })
		expect(label).toEqual('Dec 16, 2022, 09:30 PM - Feb 14, 2023, 09:30 PM')
	})
})
