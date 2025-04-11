import { Highlight } from '../index'
import { LDClientMin } from '../../integrations/launchdarkly/types/LDClient'
import { vi } from 'vitest'

describe('LD integration', () => {
	let highlight: Highlight

	beforeEach(() => {
		vi.useFakeTimers()
		highlight = new Highlight({
			organizationID: '456',
			sessionSecureID: 'abc123',
		})
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('should handle register', () => {
		const worker = (globalThis.Worker as unknown as typeof Worker).prototype
		worker.postMessage = vi.fn(
			(_message: unknown, _options?: unknown) => null,
		)

		const client: LDClientMin = {
			track: vi.fn(),
			identify: vi.fn(),
			addHook: vi.fn(),
		}
		highlight.registerLD(client)

		expect(client.addHook).not.toHaveBeenCalled()
		expect(client.identify).not.toHaveBeenCalled()
		expect(client.track).not.toHaveBeenCalled()
		expect(worker.postMessage).not.toHaveBeenCalled()

		highlight.identify('123', {})
		highlight.addProperties({
			...{ key: 'value', foo: 1.2 },
			event: 'event_key',
		})
		// noop for launchdarkly
		expect(client.identify).not.toHaveBeenCalled()
		expect(client.track).toHaveBeenCalledWith(
			'$ld:telemetry:track:event_key',
			{
				key: 'value',
				foo: 1.2,
				sessionSecureID: 'abc123',
				event: 'event_key',
				propertyType: undefined,
			},
		)
		expect(worker.postMessage).toHaveBeenCalled()
	})
})
