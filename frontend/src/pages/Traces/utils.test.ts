import { Trace } from '@/graph/generated/schemas'

import { getTraceTimes, organizeSpans } from './utils'
import { trace } from './utils.fixture'

describe('getTraceDuration', () => {
	it('should return the duration between the start and end times', () => {
		const totalDuration = getTraceTimes(trace)
		expect(totalDuration).toMatchObject({
			startTime: 1695762732000,
			endTime: 1696357107375,
			duration: 594375375,
		})
	})
})

const unsortedSpans = [
	{ spanID: 'a', spanName: 'a', parentSpanID: null, duration: 100 },
	{ spanID: 'b', spanName: 'b', parentSpanID: 'a', duration: 200 },
	{ spanID: 'c', spanName: 'c', parentSpanID: 'd', duration: 300 },
	{ spanID: 'd', spanName: 'd', parentSpanID: 'a', duration: 400 },
	{ spanID: 'e', spanName: 'e', parentSpanID: 'd', duration: 500 },
	{ spanID: 'f', spanName: 'f', parentSpanID: 'e', duration: 600 },
	{ spanID: 'g', spanName: 'g', parentSpanID: 'b', duration: 600 },
] as Trace[]

const expectedSortedTrace = [
	{
		spanID: 'a',
		spanName: 'a',
		parentSpanID: null,
		duration: 100,
		name: 'a',
		start: null,
		children: [
			{
				spanID: 'b',
				spanName: 'b',
				parentSpanID: 'a',
				duration: 200,
				name: 'b',
				start: null,
				children: [
					{
						spanID: 'g',
						spanName: 'g',
						parentSpanID: 'b',
						duration: 600,
						name: 'g',
						start: null,
					},
				],
			},
			{
				spanID: 'd',
				spanName: 'd',
				parentSpanID: 'a',
				duration: 400,
				children: [
					{
						spanID: 'c',
						spanName: 'c',
						parentSpanID: 'd',
						duration: 300,
						name: 'c',
						start: null,
					},
					{
						spanID: 'e',
						spanName: 'e',
						parentSpanID: 'd',
						duration: 500,
						name: 'e',
						start: null,
						children: [
							{
								spanID: 'f',
								spanName: 'f',
								parentSpanID: 'e',
								duration: 600,
								name: 'f',
								start: null,
							},
						],
					},
				],
				name: 'd',
				start: null,
			},
		],
	},
]

describe('organizeSpans', () => {
	it('organizes spans by parent span ID', () => {
		const sortedSpans = organizeSpans(unsortedSpans)
		expect(JSON.stringify(sortedSpans)).toEqual(
			JSON.stringify(expectedSortedTrace),
		)
	})
})
