import React, { useEffect, useMemo, useState } from 'react'

import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { Box } from '@highlight-run/ui/components'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { parseSearch } from '@/components/Search/utils'

import { ClickFilters } from './ClickFilters'
import { NavigateFilters } from './NavigateFilters'
import { TrackFilters } from './TrackFilters'

enum EventType {
	Track = 'Track',
	Click = 'Click',
	Navigate = 'Navigate',
}

const EVENT_TYPES: EventType[] = [
	EventType.Track,
	EventType.Click,
	EventType.Navigate,
]

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	startDate: Date
	endDate: Date
}

export const EventSelection: React.FC<Props> = ({
	initialQuery,
	setQuery,
	startDate,
	endDate,
}) => {
	const [eventType, setEventType] = useState<EventType>(EventType.Track)
	const [eventName, setEventName] = useState('')
	const [eventFilters, setEventFilters] = useState('')

	const [loading, setLoading] = useState(true)

	// create initial event type and filters
	useEffect(() => {
		const { queryParts } = parseSearch(initialQuery)

		let foundEventName = ''
		const foundFilters: string[] = []
		queryParts.forEach((part) => {
			if (part.key === 'event' && part.operator === '=') {
				foundEventName = part.value.replace(/^["](.*)["]$/, '$1')
			} else {
				foundFilters.push(part.text)
			}
		})

		if (EVENT_TYPES.includes(foundEventName as EventType)) {
			setEventType(foundEventName as EventType)
		} else {
			setEventName(foundEventName)
		}

		setEventFilters(foundFilters.join(' '))
		setLoading(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// recreate query when eventName or filters change
	useEffect(() => {
		const queryArray = []
		if (!!eventName) {
			queryArray.push(`event="${eventName}"`)
		}
		if (!!eventFilters) {
			queryArray.push(eventFilters)
		}
		setQuery(queryArray.join(' '))
	}, [eventName, eventFilters, setQuery])

	// set event name for special event types
	useEffect(() => {
		if (eventType !== EventType.Track) {
			setEventName(eventType)
		}
	}, [eventType])

	const eventTypeFilters = useMemo(() => {
		if (loading) {
			return
		}

		switch (eventType) {
			case EventType.Click:
				return (
					<ClickFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventFilters}
						setQuery={setEventFilters}
					/>
				)
			case EventType.Track:
				return (
					<TrackFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventFilters}
						setQuery={setEventFilters}
						eventName={eventName}
						setEventName={setEventName}
					/>
				)
			case EventType.Navigate:
				return (
					<NavigateFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventFilters}
						setQuery={setEventFilters}
					/>
				)
		}
	}, [endDate, eventFilters, eventName, eventType, loading, startDate])

	return (
		<Box
			width="full"
			display="flex"
			flexDirection="column"
			gap="12"
			p="8"
			borderRadius="8"
			border="secondary"
			backgroundColor="nested"
		>
			<LabeledRow label="Event type" name="eventType">
				<OptionDropdown
					options={EVENT_TYPES}
					selection={eventType}
					setSelection={setEventType}
				/>
			</LabeledRow>
			{eventTypeFilters}
		</Box>
	)
}
