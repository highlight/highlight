import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import { LogLevel, ProductType } from '@graph/schemas'
import { Box, defaultPresets, getNow } from '@highlight-run/ui'
import { IntegrationCta } from '@pages/LogsPage/IntegrationCta'
import LogsCount from '@pages/LogsPage/LogsCount/LogsCount'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@pages/LogsPage/useGetLogs'
import { useParams } from '@util/react-router/useParams'
import React, { useRef } from 'react'
import { Helmet } from 'react-helmet'
import { QueryParamConfig, useQueryParam } from 'use-query-params'

import { TIME_MODE } from '@/components/Search/SearchForm/constants'
import {
	EndDateParam,
	FixedRangeStartDateParam,
	PermalinkStartDateParam,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import {
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { OverageCard } from '@/pages/LogsPage/OverageCard/OverageCard'

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
	const tableContainerRef = useRef<HTMLDivElement>(null)
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const [startDate, setStartDate] = useQueryParam(
		'start_date',
		startDateDefault,
	)
	const [endDate, setEndDate] = useQueryParam('end_date', EndDateParam)

	const {
		logEdges,
		moreLogs,
		clearMoreLogs,
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
		setQuery(`${query} level:${level}`)
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
						presets={defaultPresets}
						minDate={defaultPresets[5].startDate}
						timeMode={timeMode}
						fetchKeys={useGetLogsKeysQuery}
						fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
					/>
					<LogsCount
						query={query}
						startDate={startDate}
						endDate={endDate}
						presets={defaultPresets}
					/>
					<LogsHistogram
						query={query}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={handleDatesChange}
						onLevelChange={handleLevelChange}
					/>
					<Box width="full">
						<AdditionalFeedResults
							more={moreLogs}
							type="logs"
							onClick={() => {
								clearMoreLogs()
								handleDatesChange(
									defaultPresets[0].startDate,
									getNow().toDate(),
								)
							}}
						/>
					</Box>
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
						<Box my="4">
							<OverageCard productType={ProductType.Logs} />
						</Box>
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
