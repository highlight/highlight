import LoadingBox from '@components/LoadingBox'
import TimeRangePicker from '@components/TimeRangePicker/TimeRangePicker'
import { useGetLogsQuery } from '@graph/hooks'
import { Container, Stack } from '@highlight-run/ui'
import useDataTimeRange from '@hooks/useDataTimeRange'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam, withDefault } from 'use-query-params'

const QueryParam = withDefault(StringParam, '')

const LogsPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const { timeRange } = useDataTimeRange()

	const { data, loading } = useGetLogsQuery({
		variables: {
			project_id,
			params: {
				query,
				date_range: {
					start_date: timeRange.start_date,
					end_date: timeRange.end_date,
				},
			},
		},
	})

	if (loading) {
		return <LoadingBox />
	}

	return (
		<>
			<Helmet>
				<title>Logs</title>
			</Helmet>
			<Container>
				<Stack direction="row">
					<SearchForm query={query} onFormSubmit={setQuery} />
					<TimeRangePicker />
				</Stack>
				{data?.logs && <LogsTable data={data.logs} />}
			</Container>
		</>
	)
}

export default LogsPage
