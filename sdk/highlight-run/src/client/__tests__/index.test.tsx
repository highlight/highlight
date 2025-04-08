import { Highlight } from '../index'
import { LDClientMin } from '../integrations/launchdarkly'
import { vi } from 'vitest'

describe('LD integration', () => {
	let highlight: Highlight

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = new Highlight({
			organizationID: '',
			sessionSecureID: '',
		})
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should handle register', () => {
		const client: LDClientMin = {
			track: vi.fn(),
			identify: vi.fn(),
			addHook: vi.fn(),
		}
		highlight.registerLD(client)

		expect(client.addHook).not.toHaveBeenCalled()
		expect(client.identify).not.toHaveBeenCalled()
		expect(client.track).not.toHaveBeenCalled()

		highlight.identify('123', {})
		highlight.addProperties('test', {})
		// noop for launchdarkly
		expect(client.identify).not.toHaveBeenCalled()
		expect(client.track).toHaveBeenCalled()
	})
})
