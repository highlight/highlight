import { useGetLogsQuery, useGetLogsTotalCountQuery } from '@graph/hooks'
import { Box, Preset, Stack, Text } from '@highlight-run/ui'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import {
	DateTimeParam,
	StringParam,
	useQueryParam,
	withDefault,
} from 'use-query-params'

const FORMAT = 'YYYY-MM-DDTHH:mm:00.000000000Z'
const now = moment()
const fifteenMinutesAgo = now.clone().subtract(15, 'minutes').toDate()
const PRESETS: Preset[] = [
	{
		startDate: fifteenMinutesAgo,
		label: 'Last 15 minutes',
	},
	{
		startDate: now.clone().subtract(60, 'minutes').toDate(),
		label: 'Last 60 minutes',
	},
	{
		startDate: now.clone().subtract(4, 'hours').toDate(),
		label: 'Last 4 hours',
	},
	{
		startDate: now.clone().subtract(24, 'hours').toDate(),
		label: 'Last 24 hours',
	},
	{
		startDate: now.clone().subtract(7, 'days').toDate(),
		label: 'Last 7 days',
	},
	{
		startDate: now.clone().subtract(30, 'days').toDate(),
		label: 'Last 30 days',
	},
]

const QueryParam = withDefault(StringParam, '')
const StartDateParam = withDefault(DateTimeParam, fifteenMinutesAgo)
const EndDateParam = withDefault(DateTimeParam, now.toDate())

const LogsPage = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		StartDateParam,
	)

	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)

	const { data: logs, loading } = useGetLogsQuery({
		variables: {
			project_id: project_id!,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(FORMAT),
					end_date: moment(endDate).format(FORMAT),
				},
			},
		},
		skip: !project_id,
	})

	const { data: totalCount } = useGetLogsTotalCountQuery({
		variables: {
			project_id: project_id!,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(FORMAT),
					end_date: moment(endDate).format(FORMAT),
				},
			},
		},
		skip: !project_id,
	})

	const handleFormSubmit = (value: string) => {
		setQuery(value)
	}

	const handleDatesChange = (newStartDate: Date, newEndDate: Date) => {
		setStartDate(newStartDate)
		setEndDate(newEndDate)
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
							startDate={startDate}
							endDate={endDate}
							onDatesChange={handleDatesChange}
							presets={PRESETS}
						/>
						<Stack direction="row" gap="2">
							{totalCount && (
								<Text color="weak">
									{formatNumber(totalCount.logs_total_count)}
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
