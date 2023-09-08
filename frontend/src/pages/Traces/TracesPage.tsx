import { Box } from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useQueryParam } from 'use-query-params'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import {
	EndDateParam,
	FixedRangeStartDateParam,
	QueryParam,
} from '@/components/Search/SearchForm/SearchForm'
import {
	buildSearchQueryForServer,
	parseSearchQuery,
} from '@/components/Search/SearchForm/utils'
import { useGetTracesQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { TracesList } from '@/pages/Traces/TracesList'
import { TracesSearch } from '@/pages/Traces/TracesSearch'

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
				height="fitContent"
			>
				<Box
					backgroundColor="white"
					border="dividerWeak"
					borderRadius="6"
				>
					<TracesSearch
						startDate={startDate}
						endDate={endDate}
						onFormSubmit={setQuery}
						onDatesChange={handleDatesChange}
					/>
					<TracesList traces={data?.traces} loading={loading} />
				</Box>
			</Box>
		</>
	)
}
