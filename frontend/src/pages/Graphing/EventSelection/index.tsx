import React, { useEffect, useMemo, useState } from 'react'

import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { Box } from '@highlight-run/ui/components'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { parseSearch } from '@/components/Search/utils'

import { ClickFilters } from './ClickFilters'
import { NavigateFilters } from './NavigateFilters'
import { TrackFilters } from './TrackFilters'
import { EventSelectionDetails, EventType } from '@pages/Graphing/util'

const EVENT_TYPES: EventType[] = [
	EventType.Track,
	EventType.Click,
	EventType.Navigate,
]

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	initialEvent?: EventSelectionDetails
	setEvent?: (event: EventSelectionDetails) => void
	startDate: Date
	endDate: Date
}

export const EventSelection: React.FC<Props> = ({
	initialQuery,
	setQuery,
	initialEvent,
	setEvent,
	startDate,
	endDate,
}) => {
	const [eventDetails, setEventDetails] = useState<EventSelectionDetails>(
		initialEvent ?? {
			type: EventType.Track,
			name: '',
			filters: '',
		},
	)

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
			setEventDetails((e) => ({
				...e,
				type: foundEventName as EventType,
			}))
		} else {
			setEventDetails((e) => ({ ...e, name: foundEventName }))
		}

		setEventDetails((e) => ({ ...e, filters: foundFilters.join(' ') }))
		setLoading(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// recreate query when eventName or filters change
	useEffect(() => {
		if (setEvent) {
			setEvent(eventDetails)
		}
		const queryArray = []
		if (!!eventDetails.name) {
			queryArray.push(`event="${eventDetails.name}"`)
		}
		if (!!eventDetails.filters) {
			queryArray.push(eventDetails.filters)
		}
		setQuery(queryArray.join(' '))
	}, [setQuery, setEvent, eventDetails])

	// set event name for special event types
	useEffect(() => {
		if (eventDetails.type !== EventType.Track) {
			setEventDetails((e) => ({ ...e, name: eventDetails.type }))
		}
	}, [eventDetails.type])

	const eventTypeFilters = useMemo(() => {
		if (loading) {
			return
		}

		switch (eventDetails.type) {
			case EventType.Click:
				return (
					<ClickFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventDetails.filters}
						setQuery={(filters: string) =>
							setEventDetails((e) => ({ ...e, filters }))
						}
					/>
				)
			case EventType.Track:
				return (
					<TrackFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventDetails.filters}
						setQuery={(filters: string) =>
							setEventDetails((e) => ({ ...e, filters }))
						}
						eventName={eventDetails.name}
						setEventName={(name: string) =>
							setEventDetails((e) => ({ ...e, name }))
						}
					/>
				)
			case EventType.Navigate:
				return (
					<NavigateFilters
						startDate={startDate}
						endDate={endDate}
						initialQuery={eventDetails.filters}
						setQuery={(filters: string) =>
							setEventDetails((e) => ({ ...e, filters }))
						}
					/>
				)
		}
	}, [
		endDate,
		eventDetails.filters,
		eventDetails.name,
		eventDetails.type,
		loading,
		startDate,
	])

	return (
		<Box width="full" display="flex" flexDirection="column" gap="12" p="0">
			<LabeledRow label="Event type" name="eventType">
				<OptionDropdown
					options={EVENT_TYPES}
					selection={eventDetails.type}
					setSelection={(type: EventType) =>
						setEventDetails((e) => ({ ...e, type }))
					}
				/>
			</LabeledRow>
			{eventTypeFilters}
		</Box>
	)
}
