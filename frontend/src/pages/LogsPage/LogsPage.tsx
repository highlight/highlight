import { useGetLogsQuery, useGetLogsTotalCountQuery } from '@graph/hooks'
import { Box, Stack, Text } from '@highlight-run/ui'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam, withDefault } from 'use-query-params'

const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'

const defaultEndDate = moment().format(FORMAT)
const defaultStartDate = moment(defaultEndDate)
	.subtract('30', 'days')
	.format(FORMAT)

const LogsPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	return (
		<LogsPageInner
			project_id={project_id!}
			start_date={defaultStartDate}
			end_date={defaultEndDate}
		/>
	)
}

type Props = {
	project_id: string
	start_date: string
	end_date: string
}

const QueryParam = withDefault(StringParam, '')

const LogsPageInner = ({ project_id, start_date, end_date }: Props) => {
	const [query, setQuery] = useQueryParam('query', QueryParam)

	const { data: logs, loading } = useGetLogsQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date,
					end_date,
				},
			},
		},
	})

	const { data: totalCount } = useGetLogsTotalCountQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date,
					end_date,
				},
			},
		},
	})

	const handleFormSubmit = (value: string) => {
		setQuery(value)
	}

	return (
		<>
			<Helmet>
				<title>Logs</title>
			</Helmet>
			<Box background="n2" padding="8" flex="stretch">
				<Box background="white" borderRadius="12">
					<Stack gap="4">
						<SearchForm
							initialQuery={query}
							onFormSubmit={handleFormSubmit}
							startDate={start_date}
							endDate={end_date}
						/>
						<Stack direction="row" gap="2">
							{totalCount && (
								<Text color="weak">
									{totalCount.logs_total_count}
								</Text>
							)}
							<Text color="weak">logs</Text>
						</Stack>
						<LogsTable
							data={logs}
							loading={loading}
							query={query}
						/>
					</Stack>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
