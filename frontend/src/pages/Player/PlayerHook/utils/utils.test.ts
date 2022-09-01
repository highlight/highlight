import { getSessionIntervals } from '.'
import happyPathAllIntervals from './mock_data/intervalCalculationsCorrect/allIntervals.json'
import happyPathMetadata from './mock_data/intervalCalculationsCorrect/metadata.json'
import hig211AllIntervals from './mock_data/intervalCalculationsIncorrect/allIntervals.json'
import hig211Metadata from './mock_data/intervalCalculationsIncorrect/metadata.json'

describe('getSessionIntervals', () => {
	describe('Incorrect end time calculations', () => {
		it.each([
			[
				'Happy Path e.g. a working session',
				happyPathMetadata,
				happyPathAllIntervals,
			],
			['HIG-211', hig211Metadata, hig211AllIntervals],
		])(
			'should calculate the correct intervals for %s',
			(_, metadata, allIntervals) => {
				const intervals = getSessionIntervals(metadata, allIntervals)

				let pointer = 1

				while (pointer < intervals.length) {
					const [previousInterval, currentInterval] = [
						intervals[pointer - 1],
						intervals[pointer],
					]

					expect(currentInterval.duration).toBeGreaterThanOrEqual(0)
					expect(currentInterval.endTime).toBeGreaterThanOrEqual(
						currentInterval.startTime,
					)
					expect(currentInterval.startPercent).toBeGreaterThanOrEqual(
						0,
					)
					expect(currentInterval.endPercent).toBeGreaterThanOrEqual(0)

					expect(previousInterval.duration).toBeGreaterThanOrEqual(0)
					expect(previousInterval.endTime).toBeGreaterThanOrEqual(
						previousInterval.startTime,
					)
					expect(
						previousInterval.startPercent,
					).toBeGreaterThanOrEqual(0)
					expect(previousInterval.endPercent).toBeGreaterThanOrEqual(
						0,
					)

					pointer++
				}

				const lastInterval = intervals[pointer - 1]
				expect(lastInterval.endPercent).toBe(1)
				expect(lastInterval.endTime + metadata.startTime).toBe(
					metadata.endTime,
				)
			},
		)
	})
})
