import { LogLevel } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import {
	fifteenMinutesAgo,
	now,
	PRESETS,
	thirtyDaysAgo,
} from '@pages/LogsPage/constants'
import LogsCount from '@pages/LogsPage/LogsCount/LogsCount'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@pages/LogsPage/SearchForm/SearchForm'
import { useGetLogs } from '@pages/LogsPage/useGetLogs'
import { useParams } from '@util/react-router/useParams'
import React, { useRef } from 'react'
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

	const {
		logEdges,
		loading,
		loadingAfter,
		fetchMoreForward,
		fetchMoreBackward,
	} = useGetLogs({
		query,
		project_id,
		log_cursor,
		startDate,
		endDate,
	})

	const handleFormSubmit = (value: string) => {
		if (!!value) {
			setQuery(value)
		} else {
			setQuery(undefined)
		}
	}

	const handleDatesChange = (newStartDate: Date, newEndDate: Date) => {
		setStartDate(newStartDate)
		setEndDate(newEndDate)
	}

	const handleLevelChange = (level: LogLevel) => {
		setQuery(`level:${String(level).toLowerCase()}`)
	}

	const fetchMoreWhenScrolled = React.useCallback(
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
							fetchMoreWhenScrolled(e.target as HTMLDivElement)
						}
						ref={tableContainerRef}
					>
						{logEdges.length > 0 && (
							<LogsTable
								logEdges={logEdges}
								loading={loading}
								loadingAfter={loadingAfter}
								query={query}
								tableContainerRef={tableContainerRef}
								selectedCursor={log_cursor}
							/>
						)}
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
