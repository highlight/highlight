import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { Box, Card, ComboboxSelect, Text } from '@highlight-run/ui/components'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import { ProductType } from '@/graph/generated/schemas'
import { OptionDropdown } from '@/pages/Graphing/OptionDropdown'
import { useGetKeyValuesLazyQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'

import * as comboBoxStyle from '../Combobox/styles.css'
import { parseSearch } from '@/components/Search/utils'

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	startDate: Date
	endDate: Date
}

enum EventType {
	Track = 'Track',
	Click = 'Click',
	Navigate = 'Navigate',
	Reload = 'Reload',
}

const EVENT_TYPES: EventType[] = [
	EventType.Track,
	EventType.Click,
	EventType.Navigate,
	EventType.Reload,
]

export const EventSelection: React.FC<Props> = ({
	initialQuery,
	setQuery,
	startDate,
	endDate,
}) => {
	const { projectId } = useProjectId()
	const [eventFilters, setEventFilters] = useState('')
	const [eventType, setEventType] = useState<EventType>(EventType.Track)

	const [eventName, setEventName] = useState('')
	const [eventNameQuery, setEventNameQuery] = useState('')
	const [debouncedEventNameQuery, setDebouncedEventNameQuery] = useState('')
	useDebounce(
		() => {
			setDebouncedEventNameQuery(eventNameQuery)
		},
		300,
		[eventNameQuery],
	)

	const [getKeyValues, { data }] = useGetKeyValuesLazyQuery()
	const keyValueOptions = useMemo(() => {
		const searchKeys =
			_.chain(data?.key_values || [])
				.uniq()
				.value() ?? []

		return searchKeys.map((o) => ({
			key: o,
			render: o,
		}))
	}, [data?.key_values])

	// create initial event name and filters
	useEffect(() => {
		const { queryParts } = parseSearch(initialQuery)

		let foundEventName = ''
		const foundFilters: string[] = []

		queryParts.forEach((part) => {
			if (part.key === 'event') {
				foundEventName = part.value
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// recreate query when event or filters change
	useEffect(() => {
		const eventNameQuery = eventName === '' ? '' : `event=${eventName}`
		const eventFiltersQuery = eventFilters === '' ? '' : `(${eventFilters})`

		setQuery([eventNameQuery, eventFiltersQuery].join(' '))
	}, [eventFilters, eventName, setQuery])

	// recreate query when event or filters change
	useEffect(() => {
		getKeyValues({
			variables: {
				product_type: ProductType.Events,
				key_name: 'event',
				project_id: projectId,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: debouncedEventNameQuery,
				count: 25,
			},
		})
	}, [debouncedEventNameQuery, endDate, getKeyValues, projectId, startDate])

	// set event name for special event types
	useEffect(() => {
		if (eventType !== EventType.Track) {
			setEventName(eventType)
		}
	}, [eventType])

	return (
		<SearchContext initialQuery={eventFilters} onSubmit={setEventFilters}>
			<Card>
				<Box
					width="full"
					display="flex"
					flexDirection="column"
					gap="12"
				>
					<LabeledRow label="Event type" name="eventType">
						<OptionDropdown<EventType>
							options={EVENT_TYPES}
							selection={eventType}
							setSelection={setEventType}
						/>
					</LabeledRow>
					{eventType === EventType.Track && (
						<LabeledRow label="Event name" name="eventName">
							<ComboboxSelect
								label="Event name"
								value={eventName}
								valueRender={
									<Text cssClass={comboBoxStyle.comboboxText}>
										{eventName}
									</Text>
								}
								options={keyValueOptions}
								onChange={setEventName}
								onChangeQuery={setEventNameQuery}
								cssClass={comboBoxStyle.combobox}
								wrapperCssClass={comboBoxStyle.comboboxWrapper}
								queryPlaceholder="Filter..."
							/>
						</LabeledRow>
					)}
					<LabeledRow label="Filters" name="query">
						<Box border="divider" width="full" borderRadius="6">
							<Search
								startDate={startDate}
								endDate={endDate}
								productType={ProductType.Events}
								hideIcon
							/>
						</Box>
					</LabeledRow>
				</Box>
			</Card>
		</SearchContext>
	)
}
