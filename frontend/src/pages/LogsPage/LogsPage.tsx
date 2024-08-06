import {
	MetricAggregator,
	ProductType,
	SavedSegmentEntityType,
} from '@graph/schemas'
import {
	Box,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	presetStartDate,
} from '@highlight-run/ui/components'
import { IntegrationCta } from '@pages/LogsPage/IntegrationCta'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { LogsTable } from '@pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@pages/LogsPage/useGetLogs'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useQueryParam } from 'use-query-params'

import {
	DEFAULT_COLUMN_SIZE,
	SerializedColumn,
} from '@/components/CustomColumnPopover'
import { AiSuggestion, SearchContext } from '@/components/Search/SearchContext'
import {
	TIME_FORMAT,
	TIME_MODE,
} from '@/components/Search/SearchForm/constants'
import {
	DEFAULT_INPUT_HEIGHT,
	FixedRangePreset,
	PermalinkPreset,
	QueryParam,
	SearchForm,
} from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
import {
	useGetAiQuerySuggestionLazyQuery,
	useGetMetricsQuery,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useSearchTime } from '@/hooks/useSearchTime'
import { TIMESTAMP_KEY } from '@/pages/Graphing/components/Graph'
import LogsCount from '@/pages/LogsPage/LogsCount/LogsCount'
import { LogsOverageCard } from '@/pages/LogsPage/LogsOverageCard/LogsOverageCard'
import {
	DEFAULT_LOG_COLUMNS,
	HIGHLIGHT_STANDARD_COLUMNS,
} from '@/pages/LogsPage/LogsTable/CustomColumns/columns'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import analytics from '@/util/analytics'

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

const HEADERS_AND_CHARTS_HEIGHT = 189
const LOAD_MORE_HEIGHT = 28

const LogsPageInner = ({ timeMode, logCursor, presetDefault }: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { currentWorkspace } = useApplicationContext()
	const aiQueryBuilderFlag = useFeatureFlag(Feature.AiQueryBuilder)
	const [aiMode, setAiMode] = useState(false)
	const [query, setQuery] = useQueryParam('query', QueryParam)
	const queryParts = useMemo(() => {
		return parseSearch(query).queryParts
	}, [query])

	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [
		getAiQuerySuggestion,
		{ data: aiData, error: aiError, loading: aiLoading },
	] = useGetAiQuerySuggestionLazyQuery({
		fetchPolicy: 'network-only',
	})

	const [selectedColumns, setSelectedColumns] = useLocalStorage<
		SerializedColumn[]
	>(`highlight-logs-table-columns`, DEFAULT_LOG_COLUMNS)
	const [windowSize, setWindowSize] = useLocalStorage(
		'highlight-logs-window-size',
		window.innerWidth,
	)

	// track the window size
	useEffect(() => {
		if (!!setSelectedColumns) {
			const handleResize = () => {
				setWindowSize(window.innerWidth)
			}

			window.addEventListener('resize', handleResize)

			return () => {
				window.removeEventListener('resize', handleResize)
			}
		}
	}, [setSelectedColumns, setWindowSize])

	// reset columns when window size changes
	useEffect(() => {
		if (!!setSelectedColumns) {
			const newSelectedColumns = selectedColumns.map((column) => ({
				...column,
				size:
					HIGHLIGHT_STANDARD_COLUMNS[column.id]?.size ??
					DEFAULT_COLUMN_SIZE,
			}))

			setSelectedColumns(newSelectedColumns)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [windowSize])

	const onAiSubmit = (aiQuery: string) => {
		if (project_id && aiQuery.length) {
			getAiQuerySuggestion({
				variables: {
					query: aiQuery,
					project_id: project_id!,
					product_type: ProductType.Logs,
					time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				},
			})
		}
	}

	const { data: workspaceSettings } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id || !aiQueryBuilderFlag,
	})

	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: presetDefault,
	})

	const {
		logEdges,
		moreLogs,
		pollingExpired,
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
		startDate: searchTimeContext.startDate,
		endDate: searchTimeContext.endDate,
		disablePolling: !searchTimeContext.selectedPreset,
	})

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
		useGetMetricsQuery({
			variables: {
				product_type: ProductType.Logs,
				project_id: project_id!,
				params: {
					query,
					date_range: {
						start_date: moment(searchTimeContext.startDate).format(
							TIME_FORMAT,
						),
						end_date: moment(searchTimeContext.endDate).format(
							TIME_FORMAT,
						),
					},
				},
				column: '',
				metric_types: MetricAggregator.Count,
				group_by: 'level',
				bucket_by: TIMESTAMP_KEY,
				bucket_count: 90,
			},
			skip: !projectId,
		})

	let totalCount = 0
	for (const b of histogramData?.metrics.buckets ?? []) {
		totalCount += b.metric_value ?? 0
	}

	const otherElementsHeight = useMemo(() => {
		let height = HEADERS_AND_CHARTS_HEIGHT
		if (textAreaRef.current) {
			height += textAreaRef.current.clientHeight
		} else {
			height += DEFAULT_INPUT_HEIGHT
		}

		if (moreLogs) {
			height += LOAD_MORE_HEIGHT
		}

		return height
	}, [moreLogs, textAreaRef])

	useEffect(() => {
		analytics.page('Logs')
	}, [])

	const aiSuggestion = useMemo(() => {
		const { query, date_range = {} } = aiData?.ai_query_suggestion ?? {}

		return {
			query,
			dateRange: {
				startDate: date_range.start_date
					? new Date(date_range.start_date)
					: undefined,
				endDate: date_range.end_date
					? new Date(date_range.end_date)
					: undefined,
			},
		} as AiSuggestion
	}, [aiData])

	return (
		<SearchContext
			initialQuery={query}
			onSubmit={setQuery}
			aiMode={aiMode}
			setAiMode={setAiMode}
			onAiSubmit={onAiSubmit}
			aiSuggestion={aiSuggestion}
			aiSuggestionLoading={aiLoading}
			aiSuggestionError={aiError}
			{...searchTimeContext}
		>
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
						startDate={searchTimeContext.startDate}
						endDate={searchTimeContext.endDate}
						onDatesChange={searchTimeContext.updateSearchTime}
						presets={DEFAULT_TIME_PRESETS}
						minDate={presetStartDate(DEFAULT_TIME_PRESETS[5])}
						selectedPreset={searchTimeContext.selectedPreset}
						productType={ProductType.Logs}
						timeMode={timeMode}
						savedSegmentType={SavedSegmentEntityType.Log}
						textAreaRef={textAreaRef}
						enableAIMode={
							workspaceSettings?.workspaceSettings
								?.ai_query_builder
						}
						aiSupportedSearch={aiQueryBuilderFlag}
					/>
					<LogsCount
						startDate={searchTimeContext.startDate}
						endDate={searchTimeContext.endDate}
						presetSelected={!!searchTimeContext.selectedPreset}
						totalCount={totalCount}
						loading={histogramLoading}
					/>
					<LogsHistogram
						startDate={searchTimeContext.startDate}
						endDate={searchTimeContext.endDate}
						onDatesChange={searchTimeContext.updateSearchTime}
						loading={histogramLoading}
						metrics={histogramData}
					/>
					<Box borderTop="dividerWeak" height="full">
						<LogsOverageCard />
						<IntegrationCta />
						<LogsTable
							query={query}
							queryParts={queryParts}
							logEdges={logEdges}
							loading={loading}
							error={error}
							refetch={refetch}
							loadingAfter={loadingAfter}
							selectedCursor={logCursor}
							moreLogs={moreLogs}
							clearMoreLogs={clearMoreLogs}
							handleAdditionalLogsDateChange={
								searchTimeContext.rebaseSearchTime
							}
							fetchMoreWhenScrolled={fetchMoreWhenScrolled}
							bodyHeight={`calc(100vh - ${otherElementsHeight}px)`}
							selectedColumns={selectedColumns}
							setSelectedColumns={setSelectedColumns}
							pollingExpired={pollingExpired}
						/>
					</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}

export default LogsPage
