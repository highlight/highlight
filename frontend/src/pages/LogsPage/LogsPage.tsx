import { LogLevel } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import {
	fifteenMinutesAgo,
	now,
	PRESETS,
	thirtyDaysAgo,
	TIME_MODE,
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
	QueryParamConfig,
	StringParam,
	useQueryParam,
	withDefault,
} from 'use-query-params'

const QueryParam = withDefault(StringParam, '')
const FixedRangeStartDateParam = withDefault(DateTimeParam, fifteenMinutesAgo)
const PermalinkStartDateParam = withDefault(DateTimeParam, thirtyDaysAgo)
const EndDateParam = withDefault(DateTimeParam, now.toDate())

const LogsPage = () => {
	const { log_cursor } = useParams<{
		log_cursor: string
	}>()

	const timeMode = log_cursor !== undefined ? 'permalink' : 'fixed-range'
	const startDateDefault =
		timeMode === 'permalink'
			? PermalinkStartDateParam
			: FixedRangeStartDateParam

	return (
		<LogsPageInner
			logCursor={log_cursor}
			timeMode={timeMode}
			startDateDefault={startDateDefault}
		/>
	)
}

type Props = {
	timeMode: TIME_MODE
	logCursor: string | undefined
	startDateDefault: QueryParamConfig<Date | null | undefined, Date>
}

const LogsPageInner = ({ timeMode, logCursor, startDateDefault }: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		startDateDefault,
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
		logCursor,
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
				px="8"
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
						timeMode={timeMode}
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
						<LogsTable
							logEdges={logEdges}
							loading={loading}
							loadingAfter={loadingAfter}
							query={query}
							tableContainerRef={tableContainerRef}
							selectedCursor={logCursor}
						/>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
