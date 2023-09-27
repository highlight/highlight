import { Box, defaultPresets } from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { Outlet } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	EndDateParam,
	FixedRangeStartDateParam,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import {
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'
import {
	useGetTracesKeysQuery,
	useGetTracesKeyValuesLazyQuery,
	useGetTracesQuery,
} from '@/graph/generated/hooks'
import { SortDirection } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { TracesList } from '@/pages/Traces/TracesList'

export const TracesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		FixedRangeStartDateParam,
	)
	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)
	const queryTerms = parseSearchQuery(query)
	const serverQuery = buildSearchQueryForServer(queryTerms)
	const minDate = defaultPresets[5].startDate
	const timeMode: TIME_MODE = 'fixed-range' // TODO: Support permalink mode

	const handleDatesChange = (newStartDate: Date, newEndDate: Date) => {
		setStartDate(newStartDate)
		setEndDate(newEndDate)
	}

	const { data, loading } = useGetTracesQuery({
		variables: {
			project_id: projectId,
			params: {
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
				query: serverQuery,
			},
			direction: SortDirection.Desc,
		},
	})

	return (
		<>
			<Helmet>
				<title>Traces</title>
			</Helmet>

			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				flexDirection="column"
				height="full"
				position="relative"
				overflow="hidden"
			>
				<Box
					backgroundColor="white"
					border="dividerWeak"
					borderRadius="6"
					height="full"
					shadow="medium"
				>
					<SearchForm
						initialQuery={query ?? ''}
						startDate={startDate}
						endDate={endDate}
						presets={defaultPresets}
						minDate={minDate}
						timeMode={timeMode}
						hideCreateAlert
						onFormSubmit={setQuery}
						onDatesChange={handleDatesChange}
						fetchKeys={useGetTracesKeysQuery}
						fetchValuesLazyQuery={useGetTracesKeyValuesLazyQuery}
					/>

					<TracesList traces={data?.traces} loading={loading} />
				</Box>
			</Box>

			<Outlet />
		</>
	)
}
