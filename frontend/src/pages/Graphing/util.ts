import { parseSearch } from '@components/Search/utils'

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
