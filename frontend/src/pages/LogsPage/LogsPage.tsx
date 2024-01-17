import { LogLevel, ProductType } from '@graph/schemas'
import {
	Box,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import { IntegrationCta } from '@pages/LogsPage/IntegrationCta'
import LogsCount from '@pages/LogsPage/LogsCount/LogsCount'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@pages/LogsPage/useGetLogs'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import { Helmet } from 'react-helmet'
import { useQueryParam } from 'use-query-params'

import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	FixedRangePreset,
	PermalinkPreset,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import {
	useGetLogsHistogramQuery,
	useGetLogsKeysLazyQuery,
	useGetLogsKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { OverageCard } from '@/pages/LogsPage/OverageCard/OverageCard'

const LogsPage = () => {
	const { log_cursor } = useParams<{
		log_cursor: string
	}>()

	const timeMode = log_cursor !== undefined ? 'permalink' : 'fixed-range'
	const presetDefault =
		timeMode === 'permalink' ? PermalinkPreset : FixedRangePreset

	return (
		<LogsPageInner
			logCursor={log_cursor}
			timeMode={timeMode}
			presetDefault={presetDefault}
		/>
	)
}

type Props = {
	timeMode: TIME_MODE
	logCursor: string | undefined
	presetDefault: DateRangePreset
}

const HEADERS_AND_CHARTS_HEIGHT = 228
const LOAD_MORE_HEIGHT = 28

const LogsPageInner = ({ timeMode, logCursor, presetDefault }: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [query, setQuery] = useQueryParam('query', QueryParam)

	const {
		startDate,
		endDate,
		datePickerValue,
		rebaseSearchTime,
		updateSearchTime,
	} = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: presetDefault,
	})

	const {
		logEdges,
		moreLogs,
		clearMoreLogs,
		loading,
		error,
		loadingAfter,
		fetchMoreForward,
		refetch,
	} = useGetLogs({
		query,
		project_id,
		logCursor,
		startDate,
		endDate,
		disablePolling: !datePickerValue.selectedPreset,
	})

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
				}
			}
		},
		[fetchMoreForward],
	)

	const { projectId } = useNumericProjectId()
	const { data: histogramData, loading: histogramLoading } =
		useGetLogsHistogramQuery({
			variables: {
				project_id: project_id!,
				params: {
					query,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
				},
			},
			skip: !projectId,
		})

	let otherElementsHeight = HEADERS_AND_CHARTS_HEIGHT
	if (moreLogs) {
		otherElementsHeight += LOAD_MORE_HEIGHT
	}

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
						onFormSubmit={setQuery}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={updateSearchTime}
						presets={DEFAULT_TIME_PRESETS}
						minDate={presetStartDate(DEFAULT_TIME_PRESETS[5])}
						datePickerValue={datePickerValue}
						timeMode={timeMode}
						fetchKeysLazyQuery={useGetLogsKeysLazyQuery}
						fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
						savedSegmentType="Log"
					/>
					<LogsCount
						startDate={startDate}
						endDate={endDate}
						presetSelected={!!datePickerValue.selectedPreset}
						totalCount={histogramData?.logs_histogram.objectCount}
						loading={histogramLoading}
					/>
					<LogsHistogram
						startDate={startDate}
						endDate={endDate}
						onDatesChange={updateSearchTime}
						onLevelChange={handleLevelChange}
						loading={histogramLoading}
						histogramBuckets={histogramData?.logs_histogram.buckets}
						bucketCount={histogramData?.logs_histogram.totalCount}
					/>
					<Box borderTop="dividerWeak" height="full">
						<Box my="4" px="12">
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
							selectedCursor={logCursor}
							moreLogs={moreLogs}
							clearMoreLogs={clearMoreLogs}
							handleAdditionalLogsDateChange={rebaseSearchTime}
							fetchMoreWhenScrolled={fetchMoreWhenScrolled}
							bodyHeight={`calc(100vh - ${otherElementsHeight}px)`}
						/>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default LogsPage
