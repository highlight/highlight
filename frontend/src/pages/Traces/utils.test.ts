import { Trace } from '@/graph/generated/schemas'

import {
	getTraceTimes,
	organizeSpansForFlameGraph,
	organizeSpansWithChildren,
	spanOverlaps,
} from './utils'
import { trace } from './utils.fixture'

describe('getTraceDuration', () => {
	it('should return the duration between the start and end times', () => {
		const totalDuration = getTraceTimes(trace)
		expect(totalDuration).toMatchObject({
			startTime: 1_695_762_732_000,
			duration: 60_000_003_328,
		})
	})
})

const unsortedSpans = [
	{
		spanID: 'a',
		spanName: 'a',
		parentSpanID: null,
		duration: 100,
	},
	{
		spanID: 'b',
		spanName: 'b',
		parentSpanID: 'a',
		duration: 200,
	},
	{
		spanID: 'c',
		spanName: 'c',
		parentSpanID: 'd',
		duration: 300,
	},
	{
		spanID: 'd',
		spanName: 'd',
		parentSpanID: 'a',
		duration: 400,
	},
	{
		spanID: 'e',
		spanName: 'e',
		parentSpanID: 'd',
		duration: 500,
	},
	{
		spanID: 'f',
		spanName: 'f',
		parentSpanID: 'e',
		duration: 600,
	},
	{
		spanID: 'g',
		spanName: 'g',
		parentSpanID: 'b',
		duration: 600,
	},
] as Trace[]

const expectedSortedTrace = [
	{
		spanID: 'a',
		children: [
			{
				spanID: 'b',
				children: [{ spanID: 'g' }],
			},
			{
				spanID: 'd',
				children: [
					{ spanID: 'c' },
					{ spanID: 'e', children: [{ spanID: 'f' }] },
				],
			},
		],
	},
]

describe('organizeSpansWithChildren', () => {
	it('organizes spans by parent span ID', () => {
		const sortedSpans = organizeSpansWithChildren(unsortedSpans)
		const sortedSpanIDs = flattenSpans(sortedSpans)
		expect(JSON.stringify(sortedSpanIDs)).toEqual(
			JSON.stringify(expectedSortedTrace),
		)
	})
})

const flattenSpans = (spans: any) => {
	return spans.reduce((acc: any, span: any) => {
		return span.children
			? [
					...acc,
					{
						spanID: span.spanID,
						children: flattenSpans(span.children),
					},
			  ]
			: [...acc, { spanID: span.spanID }]
	}, [])
}

const spans = {
	a: { startTime: 10, duration: 100, spanID: 'a', parentSpanID: undefined }, // 0
	b: { startTime: 15, duration: 10, spanID: 'b', parentSpanID: 'a' }, // 1
	c: { startTime: 20, duration: 10, spanID: 'c', parentSpanID: 'b' }, // 2
	d: { startTime: 26, duration: 10, spanID: 'd', parentSpanID: 'a' }, // 1
	e: { startTime: 50, duration: 10, spanID: 'e', parentSpanID: 'd' }, // 2 - child of 1
	f: { startTime: 60, duration: 10, spanID: 'f', parentSpanID: 'e' }, // 3 - child of 2
}

const unsortedSpansWithOverlaps = [
	spans.a,
	spans.b,
	spans.c,
	spans.d,
	spans.e,
	spans.f,
]

const expectedSortedSpansWithOverlaps = [['a'], ['b', 'd'], ['c', 'e'], ['f']]

describe('organizeSpansForFlameGraph', () => {
	it('organizes spans by parent span ID and ensures that all spans do not overlap', () => {
		const sortedSpans = organizeSpansForFlameGraph(
			unsortedSpansWithOverlaps,
		)

		const sortedSpansWithOverlaps = sortedSpans.map((spans) =>
			spans.map((span: Trace) => span.spanID),
		)

		expect(JSON.stringify(sortedSpansWithOverlaps)).toEqual(
			JSON.stringify(expectedSortedSpansWithOverlaps),
		)
	})
})

describe('spanOverlaps', () => {
	it('returns true when a span overlaps another span', () => {
		let span1 = { spanID: 'a', startTime: 100, duration: 200 } as Trace
		let span2 = { spanID: 'b', startTime: 50, duration: 100 } as Trace
		expect(spanOverlaps(span1, span2)).toEqual(true)

		span1 = { spanID: 'a', startTime: 100, duration: 200 } as Trace
		span2 = { spanID: 'b', startTime: 50, duration: 50 } as Trace
		expect(spanOverlaps(span1, span2)).toEqual(true)

		span1 = { spanID: 'a', startTime: 100, duration: 200 } as Trace
		span2 = { spanID: 'b', startTime: 50, duration: 49 } as Trace
		expect(spanOverlaps(span1, span2)).toEqual(false)

		span1 = { spanID: 'a', startTime: 100, duration: 200 } as Trace
		span2 = { spanID: 'b', startTime: 150, duration: 49 } as Trace
		expect(spanOverlaps(span1, span2)).toEqual(true)

		span1 = { spanID: 'a', startTime: 100, duration: 200 } as Trace
		span2 = { spanID: 'b', startTime: 50, duration: 300 } as Trace
		expect(spanOverlaps(span1, span2)).toEqual(true)
	})
})
