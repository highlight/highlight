import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'
import { Box, ComboboxSelect, Text } from '@highlight-run/ui/components'
import { ProductType } from '@/graph/generated/schemas'
import { useGetKeyValuesLazyQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { SearchContext } from '@/components/Search/SearchContext'
import { Search } from '@/components/Search/SearchForm/SearchForm'

import * as comboBoxStyle from '../Combobox/styles.css'

type Props = {
	initialQuery: string
	setQuery: (query: string) => void
	eventName: string
	setEventName: (name: string) => void
	startDate: Date
	endDate: Date
}

export const TrackFilters: React.FC<Props> = ({
	startDate,
	endDate,
	initialQuery,
	setQuery,
	eventName,
	setEventName,
}) => {
	const { projectId } = useProjectId()

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

	return (
		<>
			<LabeledRow label="Event name" name="eventName">
				<ComboboxSelect
					label="Event name"
					value={eventName}
					valueRender={
						<Text cssClass={comboBoxStyle.comboboxText}>
							{eventName || 'All events'}
						</Text>
					}
					options={keyValueOptions}
					onChange={setEventName}
					onChangeQuery={setEventNameQuery}
					cssClass={comboBoxStyle.combobox}
					wrapperCssClass={comboBoxStyle.comboboxWrapper}
					popoverCssClass={comboBoxStyle.comboboxPopover}
					queryPlaceholder="Filter..."
					creatableRender={(value) => (
						<Text cssClass={comboBoxStyle.comboboxText}>
							{value}
						</Text>
					)}
					clearable
				/>
			</LabeledRow>
			<LabeledRow label="Filters" name="query">
				<Box border="divider" width="full" borderRadius="6">
					<SearchContext
						initialQuery={initialQuery}
						onSubmit={setQuery}
					>
						<Search
							startDate={startDate}
							endDate={endDate}
							productType={ProductType.Events}
							event={eventName}
							hideIcon
						/>
					</SearchContext>
				</Box>
			</LabeledRow>
		</>
	)
}
