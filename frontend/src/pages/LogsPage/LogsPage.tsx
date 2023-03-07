import { useGetLogsQuery } from '@graph/hooks'
import { LogLevel } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import {
	fifteenMinutesAgo,
	FORMAT,
	now,
	PRESETS,
	thirtyDaysAgo,
} from '@pages/LogsPage/constants'
import LogsCount from '@pages/LogsPage/LogsCount/LogsCount'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import {
	DateTimeParam,
	StringParam,
	useQueryParam,
	withDefault,
} from 'use-query-params'

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

	const tableContainerRef = useRef<HTMLDivElement>(null)

	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)

	const [loadingAfter, setLoadingAfter] = useState(false)
	const { data, loading, fetchMore } = useGetLogsQuery({
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
		fetchPolicy: 'cache-and-network',
	})

	const handleFormSubmit = (value: string) => {
		setQuery(value)
	}

	const handleDatesChange = (newStartDate: Date, newEndDate: Date) => {
		setStartDate(newStartDate)
		setEndDate(newEndDate)
	}

	const handleLevelChange = (level: LogLevel) => {
		setQuery(`level:${String(level).toLowerCase()}`)
	}

	const fetchMoreOnBottomReached = React.useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement
				//once the user has scrolled within 100px of the bottom of the table, fetch more data if there is any
				if (scrollHeight - scrollTop - clientHeight < 100) {
					const pageInfo = data?.logs.pageInfo

					if (pageInfo && pageInfo.hasNextPage) {
						setLoadingAfter(true)
						fetchMore({
							variables: {
								project_id: project_id!,
								params: {
									query,
									date_range: {
										start_date:
											moment(startDate).format(FORMAT),
										end_date:
											moment(endDate).format(FORMAT),
									},
								},
								after: pageInfo.endCursor,
							},
						}).finally(() => {
							setLoadingAfter(false)
						})
					}
				}
			}
		},
		[data?.logs.pageInfo, endDate, fetchMore, project_id, query, startDate],
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
					<LogsHistogram
						query={query}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={handleDatesChange}
						onLevelChange={handleLevelChange}
					/>
					<LogsCount
						query={query}
						startDate={startDate}
						endDate={endDate}
						presets={PRESETS}
					/>

					<Box
						height="screen"
						px="12"
						pb="12"
						overflowY="scroll"
						onScroll={(e) =>
							fetchMoreOnBottomReached(e.target as HTMLDivElement)
						}
						ref={tableContainerRef}
					>
						<LogsTable
							data={data}
							loading={loading}
							loadingAfter={loadingAfter}
							query={query}
							tableContainerRef={tableContainerRef}
						/>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
