import { partitionIntegrations } from './utils'

describe('partitionIntegrations', () => {
	it('splits integrations into connected and available by defaultEnable', () => {
		const integrations = [
			{ key: 'slack', defaultEnable: true },
			{ key: 'linear', defaultEnable: false },
			{ key: 'github', defaultEnable: true },
		]

		const { connected, available } = partitionIntegrations(integrations)

		expect(connected.map((i) => i.key)).toEqual(['slack', 'github'])
		expect(available.map((i) => i.key)).toEqual(['linear'])
	})

	it('treats a missing defaultEnable as available', () => {
		const integrations = [{ key: 'vercel' }, { key: 'discord' }]

		const { connected, available } = partitionIntegrations(integrations)

		expect(connected).toHaveLength(0)
		expect(available.map((i) => i.key)).toEqual(['vercel', 'discord'])
	})
})
