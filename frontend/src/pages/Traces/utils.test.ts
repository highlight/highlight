import { Trace } from '@/graph/generated/schemas'

import {
	cleanAttributes,
	formatDateWithNanoseconds,
	formatTraceAttributes,
	getTraceTimes,
	humanizeDuration,
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

describe('humanizeDuration', () => {
	it('should return a humanized duration', () => {
		expect(humanizeDuration(1000000000 * 0.0001)).toEqual('100µs')
		expect(humanizeDuration(1000000000 * 0.5)).toEqual('500ms')
		expect(humanizeDuration(1000000000 + 1000000000 * 0.5)).toEqual('1.5s')
		expect(humanizeDuration(1000000000 * 60)).toEqual('1m')
		expect(humanizeDuration(1000000000 * 60 + 1000000000 * 30)).toEqual(
			'1.5m',
		)
		expect(humanizeDuration(1000000000 * 60 * 60)).toEqual('1h')
	})
})

describe('formatDateWithNanoseconds', () => {
	it('should return a formatted date', () => {
		expect(
			formatDateWithNanoseconds('2024-01-19T20:42:28.969825Z'),
		).toEqual('1/19/2024, 8:42:28.969825 pm')
	})
})

describe('formatTraceAttributes', () => {
	it('should reorder attributes correctly', () => {
		const cleanedAttributes = formatTraceAttributes(trace[0])

		const keys = Object.keys(cleanedAttributes)
		const lastKey = keys[keys.length - 1]
		expect(lastKey).toEqual('process')

		expect(cleanedAttributes['process']['executable']['path']).toEqual(
			trace[0]['traceAttributes']['process']['executable']['path'],
		)
		expect(cleanedAttributes['field']).toEqual({
			arguments: 'null',
			type: 'String',
		})
	})

	it('removes unnecessary attributes', () => {
		const cleanedAttributes = formatTraceAttributes(trace[0])
		expect(cleanedAttributes['__typename']).toBeUndefined()
	})

	it('removes empty attributes', () => {
		const span = { ...trace[0] }
		span.traceAttributes.http = {
			method: '',
			url: 'example.com',
			status_code: 200,
		}
		const cleanedAttributes = formatTraceAttributes(span)

		expect(cleanedAttributes['http']['method']).toBeUndefined()
		expect(cleanedAttributes['http']['url']).toEqual('example.com')
		expect(cleanedAttributes['http']['status_code']).toEqual(200)
	})
})

describe('cleanAttributes', () => {
	it('removes empty attributes', () => {
		const attributes = {
			empty: '',
			notEmpty: 'value',
			falsey: false,
			zero: 0,
			null: null,
			undefined: undefined,
		}
		const cleanedAttributes = cleanAttributes(attributes)

		expect(cleanedAttributes['empty']).toBeUndefined()
		expect(cleanedAttributes['notEmpty']).toEqual('value')
		expect(cleanedAttributes['falsey']).toEqual(false)
		expect(cleanedAttributes['zero']).toEqual(0)
		expect(cleanedAttributes['null']).toBeNull()
		expect(cleanedAttributes['undefined']).toBeUndefined()

		expect(Object.keys(cleanedAttributes)).toEqual([
			'notEmpty',
			'falsey',
			'zero',
			'null',
		])
	})
})
