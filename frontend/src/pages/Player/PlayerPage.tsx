import 'rc-slider/assets/index.css'

import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui/components'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { usePlayer } from '@pages/Player/PlayerHook/PlayerHook'
import { SessionViewability } from '@pages/Player/PlayerHook/PlayerState'
import {
	useLinkLogCursor,
	useShowSearchParam,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ReplayerContextProvider,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import {
	ResourcesContextProvider,
	useResources,
} from '@pages/Player/ResourcesContext/ResourcesContext'
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { getDisplayName } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import { SessionFeedV3 } from '@pages/Sessions/SessionsFeedV3/SessionsFeedV3'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import React, {
	RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import {
	NumberParam,
	StringParam,
	useQueryParam,
	withDefault,
} from 'use-query-params'

import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { AiSuggestion, SearchContext } from '@/components/Search/SearchContext'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import {
	useGetAiQuerySuggestionLazyQuery,
	useGetBillingDetailsForProjectQuery,
} from '@/graph/generated/hooks'
import { PlanType, ProductType } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'
import { useSessionFeedConfiguration } from '@/pages/Sessions/SessionsFeedV3/hooks/useSessionFeedConfiguration'
import { useGetSessions } from '@/pages/Sessions/useGetSessions'
import { useSessionParams } from '@/pages/Sessions/utils'
import { useClientIntegration } from '@/util/integrated'

import {
	DEFAULT_PANEL_WIDTH,
	LOCAL_STORAGE_PANEL_WIDTH_KEY,
	MAX_PANEL_WIDTH,
	MIN_PANEL_WIDTH,
} from './constants'
import { SessionView } from './SessionView'
import * as style from './styles.css'
import { formatResult } from '@pages/Sessions/SessionsFeedV3/SessionFeedConfigDropdown/helpers'

const PAGE_PARAM = withDefault(NumberParam, START_PAGE)

const PlayerPageBase: React.FC<{ playerRef: RefObject<HTMLDivElement> }> = ({
	playerRef,
}) => {
	const { isLoggedIn } = useAuthContext()
	const { projectId, sessionSecureId } = useSessionParams()
	const { sessionViewability, session } = useReplayerContext()
	const navigate = useNavigate()

	useEffect(() => {
		if (
			!isLoggedIn &&
			projectId !== DEMO_PROJECT_ID &&
			sessionViewability === SessionViewability.VIEWABLE &&
			((session && !session?.is_public) || !sessionSecureId)
		) {
			navigate('/')
		}
	}, [
		isLoggedIn,
		navigate,
		projectId,
		session,
		session?.is_public,
		sessionViewability,
		sessionSecureId,
	])

	const { setShowLeftPanel, showLeftPanel: showLeftPanelPreference } =
		usePlayerConfiguration()

	const { logCursor } = useLinkLogCursor()
	useEffect(() => {
		if (logCursor) {
			setShowLeftPanel(false)
		}
	}, [logCursor, setShowLeftPanel])

	const { showSearch } = useShowSearchParam()
	useEffect(() => {
		if (!showSearch) {
			setShowLeftPanel(false)
		}
	}, [showSearch, setShowLeftPanel])

	useEffect(() => {
		if (!sessionSecureId) {
			setShowLeftPanel(true)
		}
	}, [sessionSecureId, setShowLeftPanel])

	useEffect(() => analytics.page('Session'), [sessionSecureId])

	const dragHandleRef = useRef<HTMLDivElement>(null)
	const dragging = useRef(false)

	const [leftPanelWidth, setLeftPanelWidth] = useLocalStorage(
		LOCAL_STORAGE_PANEL_WIDTH_KEY,
		DEFAULT_PANEL_WIDTH,
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging.current) {
				return
			}

			e.stopPropagation()
			e.preventDefault()

			setLeftPanelWidth(
				Math.min(Math.max(e.clientX, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH),
			)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	const handleMouseUp = useCallback(() => {
		dragging.current = false
	}, [])

	useEffect(() => {
		window.addEventListener('mousemove', handleMouseMove, true)
		window.addEventListener('mouseup', handleMouseUp, true)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const showLeftPanel =
		showLeftPanelPreference && (isLoggedIn || projectId === DEMO_PROJECT_ID)

	const { playerCenterPanelRef } = usePlayerUIContext()

	return (
		<Box display="flex" height="full" width="full" overflow="hidden">
			<Box
				display={showLeftPanel ? 'block' : 'none'}
				position="relative"
				style={{
					width: `${leftPanelWidth}px`,
				}}
			>
				<Box
					ref={dragHandleRef}
					cssClass={style.panelDragHandle}
					onMouseDown={(e) => {
						e.preventDefault()
						dragging.current = true
					}}
				/>
				<SessionFeedV3 />
			</Box>
			<div
				id="playerCenterPanel"
				className={style.playerCenterPanel}
				ref={playerCenterPanelRef}
				style={{
					width: showLeftPanel
						? `calc(100% - ${leftPanelWidth}px)`
						: '100%',
				}}
			>
				<SessionView
					showLeftPanel={showLeftPanel}
					leftPanelWidth={leftPanelWidth}
					playerRef={playerRef}
				/>
			</div>
		</Box>
	)
}

export const PlayerPage = () => {
	const { projectId } = useSessionParams()
	const toolbarContext = useToolbarItems()
	const playerRef = useRef<HTMLDivElement>(null)
	const playerContext = usePlayer(playerRef)
	const { session } = playerContext
	const resourcesContext = useResources(session)

	const { integrated } = useClientIntegration()

	const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: projectId! },
		skip: !projectId || projectId === DEMO_PROJECT_ID,
	})

	const sessionQueryParam = useMemo(() => {
		const showLiveSessions =
			billingDetails?.billingDetailsForProject &&
			integrated &&
			projectId !== DEMO_PROJECT_ID &&
			projectId !== DEMO_WORKSPACE_PROXY_APPLICATION_ID &&
			billingDetails.billingDetailsForProject.plan.type ===
				PlanType.Free &&
			billingDetails.billingDetailsForProject.meter < 15

		const defaultValue = showLiveSessions
			? `completed=(true OR false) `
			: `completed=true `
		return withDefault(StringParam, defaultValue)
	}, [billingDetails?.billingDetailsForProject, integrated, projectId])

	const [query, setQuery] = useQueryParam('query', sessionQueryParam)
	const [page, setPage] = useQueryParam('page', PAGE_PARAM)
	const sessionFeedConfiguration = useSessionFeedConfiguration()

	const [aiMode, setAiMode] = useState(false)

	const { presets } = useRetentionPresets(ProductType.Sessions)
	const initialPreset = presets[5] ?? presets.at(-1)

	const searchTimeContext = useSearchTime({
		presets: presets,
		initialPreset: initialPreset,
	})

	const [
		getAiQuerySuggestion,
		{ data: aiData, error: aiError, loading: aiLoading },
	] = useGetAiQuerySuggestionLazyQuery({
		fetchPolicy: 'network-only',
	})

	const getSessionsData = useGetSessions({
		query,
		project_id: projectId,
		startDate: searchTimeContext.startDate,
		endDate: searchTimeContext.endDate,
		page,
		disablePolling: !searchTimeContext.selectedPreset,
		sortDesc: sessionFeedConfiguration.sortOrder === 'Descending',
		presetSelected: !!searchTimeContext.selectedPreset,
	})

	const handleSubmit = useCallback(
		(newQuery: string) => {
			setQuery(newQuery)
			setPage(START_PAGE)
		},
		[setPage, setQuery],
	)

	const onAiSubmit = (aiQuery: string) => {
		if (projectId && aiQuery.length) {
			getAiQuerySuggestion({
				variables: {
					query: aiQuery,
					project_id: projectId,
					product_type: ProductType.Sessions,
					time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				},
			})
		}
	}

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

	const tabTitle = !!session
		? `Sessions: ${getDisplayName(session)}`
		: 'Sessions'

	return (
		<ReplayerContextProvider value={playerContext}>
			<ResourcesContextProvider value={resourcesContext}>
				<ToolbarItemsContextProvider value={toolbarContext}>
					<SearchContext
						initialQuery={query}
						onSubmit={handleSubmit}
						loading={getSessionsData.loading}
						results={getSessionsData.sessions}
						resultFormatted={formatResult(
							getSessionsData.totalCount,
							getSessionsData.totalLength,
							getSessionsData.totalActiveLength,
							sessionFeedConfiguration.resultFormat,
						)}
						totalCount={getSessionsData.totalCount}
						moreResults={getSessionsData.moreSessions}
						resetMoreResults={getSessionsData.resetMoreSessions}
						histogramBucketSize={
							getSessionsData.histogramBucketSize
						}
						page={page}
						setPage={setPage}
						pollingExpired={getSessionsData.pollingExpired}
						aiMode={aiMode}
						setAiMode={setAiMode}
						onAiSubmit={onAiSubmit}
						aiSuggestion={aiSuggestion}
						aiSuggestionLoading={aiLoading}
						aiSuggestionError={aiError}
						{...searchTimeContext}
					>
						<Helmet>
							<title>{tabTitle}</title>
						</Helmet>
						<PlayerPageBase playerRef={playerRef} />
					</SearchContext>
				</ToolbarItemsContextProvider>
			</ResourcesContextProvider>
		</ReplayerContextProvider>
	)
}
