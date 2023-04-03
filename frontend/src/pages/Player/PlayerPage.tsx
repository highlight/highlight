import 'rc-slider/assets/index.css'

import { useAuthContext } from '@authentication/AuthContext'
import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import ElevatedCard from '@components/ElevatedCard/ElevatedCard'
import FullBleedCard from '@components/FullBleedCard/FullBleedCard'
import LoadingBox from '@components/LoadingBox'
import { useIsSessionPendingQuery } from '@graph/hooks'
import { Session } from '@graph/schemas'
import { Replayer } from '@highlight-run/rrweb'
import { Box, Callout, Text } from '@highlight-run/ui'
import { useWindowSize } from '@hooks/useWindowSize'
import { CompleteSetup } from '@pages/Player/components/CompleteSetup/CompleteSetup'
import NoActiveSessionCard from '@pages/Player/components/NoActiveSessionCard/NoActiveSessionCard'
import UnauthorizedViewingForm from '@pages/Player/components/UnauthorizedViewingForm/UnauthorizedViewingForm'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import PlayerCommentCanvas, {
	Coordinates2D,
} from '@pages/Player/PlayerCommentCanvas/PlayerCommentCanvas'
import { usePlayer } from '@pages/Player/PlayerHook/PlayerHook'
import { SessionViewability } from '@pages/Player/PlayerHook/PlayerState'
import { usePlayerLinkErrorInstance } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import PlayerPageProductTour from '@pages/Player/PlayerPageProductTour/PlayerPageProductTour'
import {
	ReplayerContextProvider,
	ReplayerState,
} from '@pages/Player/ReplayerContext'
import {
	ResourcesContextProvider,
	useResources,
} from '@pages/Player/ResourcesContext/ResourcesContext'
import RightPlayerPanel from '@pages/Player/RightPlayerPanel/RightPlayerPanel'
import SessionLevelBarV2 from '@pages/Player/SessionLevelBar/SessionLevelBarV2'
import { DevTools } from '@pages/Player/Toolbar/DevTools'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { NewCommentModal } from '@pages/Player/Toolbar/NewCommentModal/NewCommentModal'
import { Toolbar } from '@pages/Player/Toolbar/Toolbar'
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { getDisplayName } from '@pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import { SESSION_FEED_LEFT_PANEL_WIDTH } from '@pages/Sessions/SessionsFeedV3/SessionFeedV3.css'
import { SessionFeedV3 } from '@pages/Sessions/SessionsFeedV3/SessionsFeedV3'
import { useApplicationContext } from '@routers/ProjectRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import Lottie from 'lottie-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import useResizeAware from 'react-resize-aware'
import { useNavigate } from 'react-router-dom'

import WaitingAnimation from '../../lottie/waiting.json'
import * as style from './styles.css'

interface Props {
	integrated: boolean
}

const PlayerPage = ({ integrated }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()

	const [resizeListener, sizes] = useResizeAware()
	const { width } = useWindowSize()

	const playerContext = usePlayer()
	const {
		state: replayerState,
		setScale,
		replayer,
		time,
		sessionViewability,
		isPlayerReady,
		session,
		currentUrl,
	} = playerContext

	const navigate = useNavigate()

	useEffect(() => {
		if (
			!isLoggedIn &&
			sessionViewability === SessionViewability.VIEWABLE &&
			((session && !session?.is_public) || !session_secure_id)
		) {
			navigate('/')
		}
	}, [
		isLoggedIn,
		navigate,
		session,
		session?.is_public,
		sessionViewability,
		session_secure_id,
	])

	const { data: isSessionPendingData, loading } = useIsSessionPendingQuery({
		variables: {
			session_secure_id: session_secure_id!,
		},
		skip:
			!session_secure_id ||
			sessionViewability !== SessionViewability.ERROR,
	})

	const resourcesContext = useResources(session)

	const {
		setShowLeftPanel,
		setShowRightPanel,
		setSelectedDevToolsTab,
		setShowDevTools,
		showLeftPanel: showLeftPanelPreference,
		showRightPanel,
	} = usePlayerConfiguration()
	const { setRightPanelView, setActiveError } = usePlayerUIContext()

	const { errorObject } = usePlayerLinkErrorInstance()
	useEffect(() => {
		if (errorObject) {
			setShowLeftPanel(false)
			setShowRightPanel(true)
			setShowDevTools(true)
			setSelectedDevToolsTab(Tab.Errors)
			setActiveError({ ...errorObject, session })
			setRightPanelView(RightPanelView.Error)
		}
	}, [
		errorObject,
		session,
		setActiveError,
		setRightPanelView,
		setSelectedDevToolsTab,
		setShowDevTools,
		setShowLeftPanel,
		setShowRightPanel,
	])

	const toolbarContext = useToolbarItems()

	const playerWrapperRef = useRef<HTMLDivElement>(null)

	const newCommentModalRef = useRef<HTMLDivElement>(null)
	const [commentModalPosition, setCommentModalPosition] = useState<
		Coordinates2D | undefined
	>(undefined)
	const [commentPosition, setCommentPosition] = useState<
		Coordinates2D | undefined
	>(undefined)

	useEffect(() => {
		if (!session_secure_id) {
			setShowLeftPanel(true)
		}
	}, [session_secure_id, setShowLeftPanel])

	const resizePlayer = useCallback(
		(replayer: Replayer): boolean => {
			const width = replayer?.wrapper?.getBoundingClientRect().width
			const height = replayer?.wrapper?.getBoundingClientRect().height
			const targetWidth = playerWrapperRef.current?.clientWidth
			const targetHeight = playerWrapperRef.current?.clientHeight
			if (!width || !targetWidth || !height || !targetHeight) {
				return false
			}
			const widthScale = (targetWidth - style.PLAYER_PADDING_X) / width
			const heightScale = (targetHeight - style.PLAYER_PADDING_Y) / height
			const scale = Math.min(heightScale, widthScale)
			// If calculated scale is close enough to 1, return to avoid
			// infinite looping caused by small floating point math differences
			if (scale >= 0.9999 && scale <= 1.0001) {
				return true
			}

			if (scale <= 0) {
				return false
			}

			setScale((s) => {
				const replayerScale = s * scale

				// why translate -50 -50 -> https://medium.com/front-end-weekly/absolute-centering-in-css-ea3a9d0ad72e
				replayer?.wrapper?.setAttribute(
					'style',
					`transform: scale(${replayerScale}) translate(-50%, -50%)`,
				)
				replayer?.wrapper?.setAttribute(
					'class',
					`replayer-wrapper ${style.rrwebInnerWrapper}`,
				)

				return replayerScale
			})
			return true
		},
		[setScale],
	)

	// This adjusts the dimensions (i.e. scale()) of the iframe when the page loads.
	useEffect(() => {
		const i = window.setInterval(() => {
			if (replayer && resizePlayer(replayer)) {
				clearInterval(i)
			}
		}, 1000 / 60)
		return () => {
			i && clearInterval(i)
		}
	}, [resizePlayer, replayer])

	const playerBoundingClientRectWidth =
		replayer?.wrapper?.getBoundingClientRect().width
	const playerBoundingClientRectHeight =
		replayer?.wrapper?.getBoundingClientRect().height

	// On any change to replayer, 'sizes', refresh the size of the player.
	useEffect(() => {
		replayer && resizePlayer(replayer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		sizes,
		replayer,
		playerBoundingClientRectWidth,
		playerBoundingClientRectHeight,
	])

	useEffect(() => analytics.page(), [session_secure_id])

	const showLeftPanel =
		showLeftPanelPreference &&
		sessionViewability !== SessionViewability.OVER_BILLING_QUOTA &&
		isLoggedIn

	const [centerColumnResizeListener, centerColumnSize] = useResizeAware()
	const controllerWidth = centerColumnSize.width
		? Math.max(style.MIN_CENTER_COLUMN_WIDTH, centerColumnSize.width ?? 0)
		: 0

	const playerFiller = useMemo(() => {
		const playerHeight =
			playerWrapperRef.current?.getBoundingClientRect().height
		const height = ((playerHeight ?? 0) * 3) / 5
		return <LoadingBox width={controllerWidth} height={height} />
	}, [controllerWidth])

	const replayerWrapperBbox = replayer?.wrapper.getBoundingClientRect()

	const showSession =
		(sessionViewability === SessionViewability.VIEWABLE && !!session) ||
		(replayerState !== ReplayerState.Empty &&
			sessionViewability !== SessionViewability.ERROR) ||
		(replayerState === ReplayerState.Empty && !!session_secure_id)

	const { isPlayerFullscreen, playerCenterPanelRef } = usePlayerUIContext()

	const sessionView = showSession ? (
		<Box
			background="raised"
			height="full"
			p="8"
			width="full"
			display="flex"
		>
			<div className={style.rrwebPlayerSection}>
				<Box
					display="flex"
					flexDirection="column"
					width="full"
					height="full"
				>
					{!isPlayerFullscreen && (
						<SessionLevelBarV2
							width={
								width -
								(showLeftPanel
									? SESSION_FEED_LEFT_PANEL_WIDTH
									: 0) -
								3 * style.PLAYER_PADDING
							}
						/>
					)}
					<Box
						height="full"
						cssClass={[
							style.playerBody,
							{
								[style.withRightPanel]: showRightPanel,
							},
						]}
					>
						<div className={style.playerCenterColumn}>
							{centerColumnResizeListener}
							<div className={style.playerWrapperV2}>
								<div
									className={style.rrwebPlayerWrapper}
									ref={playerWrapperRef}
								>
									{resizeListener}
									{replayerState ===
										ReplayerState.SessionRecordingStopped && (
										<Box
											display="flex"
											alignItems="center"
											flexDirection="column"
											justifyContent="center"
											position="absolute"
											style={{
												height: replayerWrapperBbox?.height,
												width: replayerWrapperBbox?.width,
												zIndex: 2,
											}}
										>
											<ManualStopCard />
										</Box>
									)}
									<div
										style={{
											visibility: isPlayerReady
												? 'visible'
												: 'hidden',
										}}
										className="highlight-block"
										id="player"
									/>
									<PlayerCommentCanvas
										setModalPosition={
											setCommentModalPosition
										}
										modalPosition={commentModalPosition}
										setCommentPosition={setCommentPosition}
									/>
									{!isPlayerReady && playerFiller}
								</div>
								<Toolbar width={controllerWidth} />
							</div>
							<DevTools width={controllerWidth} />
						</div>
						{!isPlayerFullscreen && <RightPlayerPanel />}
					</Box>
				</Box>
			</div>
		</Box>
	) : null

	const sessionFiller = useMemo(() => {
		switch (sessionViewability) {
			case SessionViewability.OVER_BILLING_QUOTA:
				return (
					<FullBleedCard
						title="Session quota reached 😔"
						animation={<Lottie animationData={WaitingAnimation} />}
					>
						<Box
							display="flex"
							alignItems="center"
							flexDirection="column"
						>
							<p>
								This session was recorded after you reached your
								session quota. To view it, upgrade your plan.
							</p>
							<ButtonLink
								to={`/w/${currentWorkspace?.id}/upgrade-plan`}
								trackingId="PlayerPageUpgradePlan"
							>
								Upgrade Plan
							</ButtonLink>
						</Box>
					</FullBleedCard>
				)
			case SessionViewability.ERROR:
				if (loading) {
					return <LoadingBox />
				} else if (isSessionPendingData?.isSessionPending) {
					return (
						<Box m="auto" style={{ maxWidth: 300 }}>
							<Callout
								kind="info"
								title="This session is on the way!"
							>
								<Box pb="6">
									<Text>
										We are processing the data and will show
										the recording here soon. Please come
										back in a minute.
									</Text>
								</Box>
							</Callout>
						</Box>
					)
				} else {
					return (
						<Box m="auto" style={{ maxWidth: 300 }}>
							<Callout kind="info" title="Can't load session">
								<Box pb="6">
									<Text>
										This session does not exist or has not
										been made public.
									</Text>
								</Box>
							</Callout>
						</Box>
					)
				}
			case SessionViewability.EMPTY_SESSION:
				return (
					<ElevatedCard
						title="Session isn't ready to view yet 😔"
						animation={<Lottie animationData={WaitingAnimation} />}
						className={style.emptySessionCard}
					>
						<p>
							We need more time to process this session.{' '}
							{!isOnPrem ? (
								<>
									If this looks like a bug, shoot us a message
									on{' '}
									<span
										className={style.intercomLink}
										onClick={() => {
											window.Intercom(
												'showNewMessage',
												`I'm seeing an empty session. This is the session ID: "${session_secure_id}"`,
											)
										}}
									>
										Intercom
									</span>
									.
								</>
							) : (
								<>
									If this looks like a bug, please reach out
									to us!
								</>
							)}
						</p>
					</ElevatedCard>
				)
			default:
				return (
					<div className={style.playerContainer}>
						<div className={style.rrwebPlayerSection}>
							<Box
								display="flex"
								flexDirection="column"
								width="full"
								height="full"
							>
								<SessionLevelBarV2 width="100%" />
								<Box
									width="full"
									height="full"
									display="flex"
									justifyContent="center"
									borderTop="secondary"
								>
									{integrated ? (
										<NoActiveSessionCard />
									) : (
										<CompleteSetup />
									)}
								</Box>
							</Box>
						</div>
					</div>
				)
		}
	}, [
		currentWorkspace?.id,
		isSessionPendingData?.isSessionPending,
		loading,
		sessionViewability,
		session_secure_id,
		integrated,
	])

	return (
		<ReplayerContextProvider value={playerContext}>
			<ResourcesContextProvider value={resourcesContext}>
				<ToolbarItemsContextProvider value={toolbarContext}>
					<Helmet>
						<title>{getTabTitle(session)}</title>
					</Helmet>
					{isPlayerReady && !isLoggedIn && <PlayerPageProductTour />}
					<Box
						cssClass={clsx(style.playerBody, {
							[style.withLeftPanel]: showLeftPanel,
						})}
						height="full"
						width="full"
						overflow="hidden"
					>
						<Box
							cssClass={clsx(style.playerLeftPanel, {
								[style.playerLeftPanelHidden]: !showLeftPanel,
							})}
						>
							<SessionFeedV3 />
						</Box>
						<div
							id="playerCenterPanel"
							className={style.playerCenterPanel}
							ref={playerCenterPanelRef}
						>
							{showSession ? sessionView : sessionFiller}
						</div>
						<UnauthorizedViewingForm />
						<NewCommentModal
							newCommentModalRef={newCommentModalRef}
							commentModalPosition={commentModalPosition}
							commentPosition={commentPosition}
							commentTime={time}
							session={session}
							session_secure_id={session_secure_id}
							onCancel={() => {
								setCommentModalPosition(undefined)
							}}
							currentUrl={currentUrl}
						/>
					</Box>
				</ToolbarItemsContextProvider>
			</ResourcesContextProvider>
		</ReplayerContextProvider>
	)
}

const ManualStopCard: React.FC = () => {
	return (
		<ElevatedCard title="Session recording manually stopped">
			<p>
				<a
					href="https://docs.highlight.run/api/hstop"
					target="_blank"
					rel="noreferrer"
				>
					<code>H.stop()</code>
				</a>{' '}
				was called during the session. Calling this method stops the
				session recording. If you expect the recording to continue
				please check where you are calling{' '}
				<a
					href="https://docs.highlight.run/api/hstop"
					target="_blank"
					rel="noreferrer"
				>
					<code>H.stop()</code>
				</a>
				.
			</p>
		</ElevatedCard>
	)
}

export default PlayerPage

const getTabTitle = (session?: Session) => {
	if (!session) {
		return 'Sessions'
	}
	return `Sessions: ${getDisplayName(session)}`
}
