import { Box, Table, Text } from '@highlight-run/ui'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { useQueryParam } from 'use-query-params'

import { useGetTracesQuery } from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { LOG_TIME_FORMAT } from '@/pages/LogsPage/constants'
import {
	EndDateParam,
	FixedRangeStartDateParam,
	QueryParam,
} from '@/pages/LogsPage/LogsPage'
import {
	buildLogsQueryForServer,
	parseLogsQuery,
} from '@/pages/LogsPage/SearchForm/utils'

export const TracesPage: React.FC = () => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()
	const [query] = useQueryParam('query', QueryParam)
	const [startDate] = useQueryParam('start_date', FixedRangeStartDateParam)
	const [endDate] = useQueryParam('end_date', EndDateParam)
	const queryTerms = parseLogsQuery(query)
	const serverQuery = buildLogsQueryForServer(queryTerms)

	const { data, loading } = useGetTracesQuery({
		variables: {
			project_id: projectId,
			params: {
				date_range: {
					start_date: moment(startDate).format(LOG_TIME_FORMAT),
					end_date: moment(endDate).format(LOG_TIME_FORMAT),
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
			>
				{loading ? (
					<Text>Loading...</Text>
				) : (
					<Table>
						<Table.Head>
							<Table.Row>
								<Table.Header>Span</Table.Header>
								<Table.Header>Service</Table.Header>
								<Table.Header>Span ID</Table.Header>
								<Table.Header>Parent Span ID</Table.Header>
								<Table.Header>Secure Session ID</Table.Header>
								<Table.Header>Status</Table.Header>
							</Table.Row>
						</Table.Head>
						{data?.traces.map((trace, index) => (
							<Table.Row key={index}>
								<Table.Cell>{trace.spanName}</Table.Cell>
								<Table.Cell>{trace.serviceName}</Table.Cell>
								<Table.Cell>{trace.spanID}</Table.Cell>
								<Table.Cell
									onClick={
										trace.parentSpanID
											? () => {
													navigate(
														`/${projectId}/traces?query=${window.encodeURIComponent(
															`ParentSpanId:${trace.parentSpanID}`,
														)}`,
													)
											  }
											: undefined
									}
								>
									{trace.parentSpanID}
								</Table.Cell>
								<Table.Cell
									onClick={() => {
										navigate(
											`/${projectId}/sessions/${trace.secureSessionID}`,
										)
									}}
								>
									{trace.secureSessionID}
								</Table.Cell>
								<Table.Cell>{trace.statusMessage}</Table.Cell>
							</Table.Row>
						))}
					</Table>
				)}
			</Box>
		</>
	)
}
