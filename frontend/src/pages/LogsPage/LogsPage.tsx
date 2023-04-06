import { LogLevel } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import {
	fifteenMinutesAgo,
	LOG_TIME_PRESETS,
	now,
	thirtyDaysAgo,
	TIME_MODE,
} from '@pages/LogsPage/constants'
import { IntegrationCta } from '@pages/LogsPage/IntegrationCta'
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

export const QueryParam = withDefault(StringParam, '')
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
		error,
		loadingAfter,
		fetchMoreForward,
		fetchMoreBackward,
		refetch,
	} = useGetLogs({
		query,
		project_id,
		logCursor,
		startDate,
		endDate,
	})

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
					shadow="medium"
				>
					<SearchForm
						initialQuery={query}
						onFormSubmit={(value) => setQuery(value)}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={handleDatesChange}
						presets={LOG_TIME_PRESETS}
						minDate={thirtyDaysAgo}
						timeMode={timeMode}
					/>
					<LogsCount
						query={query}
						startDate={startDate}
						endDate={endDate}
						presets={LOG_TIME_PRESETS}
					/>
					<LogsHistogram
						query={query}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={handleDatesChange}
						onLevelChange={handleLevelChange}
					/>
					<Box
						borderTop="dividerWeak"
						height="screen"
						pt="4"
						px="12"
						pb="12"
						overflowY="auto"
						onScroll={(e) =>
							fetchMoreWhenScrolled(e.target as HTMLDivElement)
						}
						ref={tableContainerRef}
					>
						<IntegrationCta />
						<LogsTable
							logEdges={logEdges}
							loading={loading}
							error={error}
							refetch={refetch}
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
