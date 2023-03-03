import { useGetLogsTotalCountQuery } from '@graph/hooks'
import { Box, Preset, Stack, Text } from '@highlight-run/ui'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useGetLogs } from '@pages/LogsPage/useGetLogs'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useRef } from 'react'
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
const thirtyDaysAgo = now.clone().subtract(30, 'days').toDate()
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
		startDate: thirtyDaysAgo,
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
	const { log_cursor } = useParams<{
		log_cursor: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		StartDateParam,
	)

	const tableContainerRef = useRef<HTMLDivElement>(null)

	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)

	const { logEdges, loading, fetchMoreForward, fetchMoreBackward } =
		useGetLogs({
			query,
			project_id,
			log_cursor,
			startDate,
			endDate,
		})

	const { data: totalCount, loading: logCountLoading } =
		useGetLogsTotalCountQuery({
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

	const fetchMore = React.useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement
				//once the user has scrolled within 100px of the bottom of the table, fetch more data if there is any
				if (scrollHeight - scrollTop - clientHeight < 100) {
					fetchMoreForward()
				} else if (scrollTop === 0) {
					fetchMoreBackward()
				}
			}
		},
		[fetchMoreForward, fetchMoreBackward],
	)

	return (
		<>
			<Helmet>
				<title>Logs</title>
			</Helmet>
			<Box
				background="n2"
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
			>
				<Box
					background="white"
					borderRadius="6"
					gap="4"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="small"
				>
					<SearchForm
						initialQuery={query}
						onFormSubmit={handleFormSubmit}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={handleDatesChange}
						presets={PRESETS}
						minDate={thirtyDaysAgo}
					/>
					<Stack direction="row" gap="2" px="12" py="8">
						{logCountLoading ? (
							<Text size="xSmall" color="weak">
								Loading...
							</Text>
						) : (
							totalCount && (
								<>
									<Text size="xSmall" color="weak">
										{formatNumber(
											totalCount.logs_total_count,
										)}{' '}
										logs
									</Text>
								</>
							)
						)}
					</Stack>

					<div
						style={{
							height: '100vh',
							overflow: 'auto',
						}}
						onScroll={(e) => fetchMore(e.target as HTMLDivElement)}
						ref={tableContainerRef}
					>
						<LogsTable
							logEdges={logEdges}
							loading={loading}
							query={query}
							selectedCursor={log_cursor}
						/>
					</div>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
