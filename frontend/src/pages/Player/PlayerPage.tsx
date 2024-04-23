import 'rc-slider/assets/index.css'

import { useAuthContext } from '@authentication/AuthContext'
import { Session } from '@graph/schemas'
import { Box, DEFAULT_TIME_PRESETS } from '@highlight-run/ui/components'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { Coordinates2D } from '@pages/Player/PlayerCommentCanvas/PlayerCommentCanvas'
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
import { NewCommentModal } from '@pages/Player/Toolbar/NewCommentModal/NewCommentModal'
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { getDisplayName } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import { SessionFeedV3 } from '@pages/Sessions/SessionsFeedV3/SessionsFeedV3'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import {
	NumberParam,
	StringParam,
	useQueryParam,
	withDefault,
} from 'use-query-params'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import { SearchContext } from '@/components/Search/SearchContext'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { useSearchTime } from '@/hooks/useSearchTime'
import { useSessionFeedConfiguration } from '@/pages/Sessions/SessionsFeedV3/SessionQueryBuilder/hooks/useSessionFeedConfiguration'
import { useGetSessions } from '@/pages/Sessions/useGetSessions'
import { useSessionParams } from '@/pages/Sessions/utils'

import {
	DEFAULT_PANEL_WIDTH,
	LOCAL_STORAGE_PANEL_WIDTH_KEY,
	MAX_PANEL_WIDTH,
	MIN_PANEL_WIDTH,
} from './constants'
import { SessionView } from './SessionView'
import * as style from './styles.css'

const PAGE_PARAM = withDefault(NumberParam, START_PAGE)
const ERROR_QUERY_PARAM = withDefault(StringParam, `processed=true`)

const PlayerPageBase: React.FC = () => {
	const { isLoggedIn } = useAuthContext()
	const { projectId, sessionSecureId } = useSessionParams()

	const [query, setQuery] = useQueryParam('query', ERROR_QUERY_PARAM)
	const [page, setPage] = useQueryParam('page', PAGE_PARAM)
	const sessionFeedConfiguration = useSessionFeedConfiguration()

	const searchTimeContext = useSearchTime({
		presets: DEFAULT_TIME_PRESETS,
		initialPreset: DEFAULT_TIME_PRESETS[5],
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

	const { time, sessionViewability, session, currentUrl } = usePlayer()
	const { setSessionResults } = useReplayerContext()

	useEffect(() => {
		setSessionResults({
			totalCount: getSessionsData.totalCount,
			sessions: getSessionsData.sessions as Session[],
		})
	}, [
		setSessionResults,
		getSessionsData.totalCount,
		getSessionsData.sessions,
	])

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

	const [commentModalPosition, setCommentModalPosition] = useState<
		Coordinates2D | undefined
	>(undefined)
	const [commentPosition, setCommentPosition] = useState<
		Coordinates2D | undefined
	>(undefined)

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
		<SearchContext
			initialQuery={query}
			onSubmit={handleSubmit}
			loading={getSessionsData.loading}
			results={getSessionsData.sessions}
			totalCount={getSessionsData.totalCount}
			moreResults={getSessionsData.moreSessions}
			resetMoreResults={getSessionsData.resetMoreSessions}
			histogramBucketSize={getSessionsData.histogramBucketSize}
			page={page}
			setPage={setPage}
			{...searchTimeContext}
		>
			<Helmet>
				<title>{getTabTitle(session)}</title>
			</Helmet>
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
						modalPosition={commentModalPosition}
						setModalPosition={setCommentModalPosition}
						setCommentPosition={setCommentPosition}
					/>
				</div>
				<NewCommentModal
					commentModalPosition={commentModalPosition}
					commentPosition={commentPosition}
					commentTime={time}
					session={session}
					session_secure_id={sessionSecureId}
					onCancel={() => {
						setCommentModalPosition(undefined)
					}}
					currentUrl={currentUrl}
				/>
			</Box>
		</SearchContext>
	)
}

const getTabTitle = (session?: Session) => {
	if (!session) {
		return 'Sessions'
	}
	return `Sessions: ${getDisplayName(session)}`
}

export const PlayerPage = () => {
	const toolbarContext = useToolbarItems()
	const playerContext = usePlayer()
	const { session } = playerContext
	const resourcesContext = useResources(session)

	return (
		<ReplayerContextProvider value={playerContext}>
			<ResourcesContextProvider value={resourcesContext}>
				<ToolbarItemsContextProvider value={toolbarContext}>
					<PlayerPageBase />
				</ToolbarItemsContextProvider>
			</ResourcesContextProvider>
		</ReplayerContextProvider>
	)
}
