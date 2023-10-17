import { getTraceDuration } from './utils'
import { trace } from './utils.fixture'

describe('getTraceDuration', () => {
	it('should return the duration between the start and end times', () => {
		const totalDuration = getTraceDuration(trace)
		expect(totalDuration).toEqual(594375)
	})
})
