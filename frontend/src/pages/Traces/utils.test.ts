import { cloneDeep } from 'lodash'

import { Trace, TraceError } from '@/graph/generated/schemas'

import { getTraceDuration, organizeSpans } from './utils'
import { trace } from './utils.fixture'

describe('getTraceDuration', () => {
	it('should return the duration between the start and end times', () => {
		const totalDuration = getTraceDuration(trace)
		expect(totalDuration).toEqual(594375)
	})
})

const unsortedSpans = [
	{ spanID: 'a', spanName: 'a', parentSpanID: null, duration: 100 },
	{ spanID: 'b', spanName: 'b', parentSpanID: 'a', duration: 200 },
	{ spanID: 'c', spanName: 'c', parentSpanID: 'd', duration: 300 },
	{ spanID: 'd', spanName: 'd', parentSpanID: 'a', duration: 400 },
	{ spanID: 'e', spanName: 'e', parentSpanID: 'd', duration: 500 },
	{ spanID: 'f', spanName: 'f', parentSpanID: 'e', duration: 600 },
] as Trace[]

const expectedSortedTrace = {
	spanID: 'a',
	spanName: 'a',
	parentSpanID: null,
	duration: 100,
	name: 'a',
	value: 100,
	color: '#744ED4',
	backgroundColor: '#E7DEFC',
	children: [
		{
			spanID: 'b',
			spanName: 'b',
			parentSpanID: 'a',
			duration: 200,
			name: 'b',
			value: 200,
			color: '#744ED4',
			backgroundColor: '#E7DEFC',
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
					value: 300,
					color: '#744ED4',
					backgroundColor: '#E7DEFC',
				},
				{
					spanID: 'e',
					spanName: 'e',
					parentSpanID: 'd',
					duration: 500,
					name: 'e',
					value: 500,
					color: '#744ED4',
					backgroundColor: '#E7DEFC',
					children: [
						{
							spanID: 'f',
							spanName: 'f',
							parentSpanID: 'e',
							duration: 600,
							name: 'f',
							value: 600,
							color: '#744ED4',
							backgroundColor: '#E7DEFC',
						},
					],
				},
			],
			name: 'd',
			value: 400,
			color: '#744ED4',
			backgroundColor: '#E7DEFC',
		},
	],
}

describe('organizeSpans', () => {
	it('organizes spans by parent span ID', () => {
		const sortedSpans = organizeSpans(unsortedSpans)
		expect(JSON.stringify(sortedSpans)).toEqual(
			JSON.stringify(expectedSortedTrace),
		)
	})

	it('assigns error information to spans', () => {
		const errors = [
			{
				span_id: 'f',
				event: 'an error occurred',
			},
		] as TraceError[]
		const expectedSpans: any = cloneDeep(expectedSortedTrace)
		expectedSpans.children[1].children[1].children[0].errors = [errors[0]]

		const sortedSpans = organizeSpans(unsortedSpans, errors)
		expect(JSON.stringify(sortedSpans)).toEqual(
			JSON.stringify(expectedSpans),
		)
	})

	it('assigns attributes to selected span', () => {
		const selectedSpan = unsortedSpans[5]
		const expectedSpans: any = cloneDeep(expectedSortedTrace)
		expectedSpans.children[1].children[1].children[0].selected = true
		expectedSpans.children[1].children[1].children[0].color = '#fff'
		expectedSpans.children[1].children[1].children[0].backgroundColor =
			'#744ED4'

		const organizedSpans = organizeSpans(
			unsortedSpans,
			undefined,
			selectedSpan,
		)
		expect(organizedSpans).toMatchObject(expectedSpans)
	})
})
