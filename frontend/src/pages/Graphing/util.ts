import { parseSearch } from '@components/Search/utils'
import {
	FREQUENCIES,
	SECONDS_PER_DAY,
	SECONDS_PER_WEEK,
} from '@/pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'

export enum EventType {
	Track = 'Track',
	Click = 'Click',
	Navigate = 'Navigate',
}

export type EventSelectionDetails = {
	type: EventType
	name: string
	filters: string
}
export type EventSelectionStep = {
	title: string
	query: string
	event: EventSelectionDetails
}
export const loadFunnelStep = (
	step: Omit<EventSelectionStep, 'event'>,
): EventSelectionStep => {
	const { queryParts } = parseSearch(step.query)
	const event = queryParts.find((qp) => qp.key === 'event')
	const eventValue = (event?.value ?? '').replace(/^"(.+)"$/, '$1')
	const type = Object.hasOwn(EventType, eventValue)
		? (eventValue as EventType)
		: EventType.Track
	return {
		...step,
		event: {
			name: eventValue,
			type,
			filters: queryParts
				.filter((qp) => qp.key !== 'event')
				.map((qp) => qp.text)
				.join(' '),
		},
	}
}

export const BUCKET_FREQUENCIES = [
	...FREQUENCIES,
	{
		name: '2 weeks',
		value: `${SECONDS_PER_WEEK * 2}`,
		id: '14d',
	},
	{
		name: '4 weeks',
		value: `${SECONDS_PER_WEEK * 4}`,
		id: '28d',
	},
	{
		name: '1 month',
		value: `${SECONDS_PER_DAY * 30}`,
		id: '30d',
	},
]
