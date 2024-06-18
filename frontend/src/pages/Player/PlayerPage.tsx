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
import { SearchContext } from '@/components/Search/SearchContext'
import { useRetentionPresets } from '@/components/Search/SearchForm/hooks'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { useGetBillingDetailsForProjectQuery } from '@/graph/generated/hooks'
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
	const [dragging, setDragging] = useState(false)

	const [leftPanelWidth, setLeftPanelWidth] = useLocalStorage(
		LOCAL_STORAGE_PANEL_WIDTH_KEY,
		DEFAULT_PANEL_WIDTH,
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging) {
				return
			}

			e.stopPropagation()
			e.preventDefault()

			setLeftPanelWidth(
				Math.min(Math.max(e.clientX, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH),
			)
		},
		[dragging, setLeftPanelWidth],
	)

	const handleMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleMouseMove, true)
			window.addEventListener('mouseup', handleMouseUp, true)
		} else {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
	}, [dragging, handleMouseMove, handleMouseUp])

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
						setDragging(true)
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

	const { presets } = useRetentionPresets(ProductType.Sessions)

	const searchTimeContext = useSearchTime({
		presets: presets,
		initialPreset: presets[5],
	})

	const getSessionsData = useGetSessions({
		query,
		project_id: projectId,
		startDate: searchTimeContext.startDate,
		endDate: searchTimeContext.endDate,
		page,
		disablePolling: !searchTimeContext.selectedPreset,
		sortDesc: sessionFeedConfiguration.sortOrder === 'Descending',
	})

	const handleSubmit = useCallback(
		(newQuery: string) => {
			setQuery(newQuery)
			setPage(START_PAGE)
		},
		[setPage, setQuery],
	)

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
						totalCount={getSessionsData.totalCount}
						moreResults={getSessionsData.moreSessions}
						resetMoreResults={getSessionsData.resetMoreSessions}
						histogramBucketSize={
							getSessionsData.histogramBucketSize
						}
						page={page}
						setPage={setPage}
						pollingExpired={getSessionsData.pollingExpired}
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
