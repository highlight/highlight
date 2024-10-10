import { Box, Stack } from '@highlight-run/ui/components'
import clsx from 'clsx'
import { stringify } from 'query-string'
import { useMemo, useRef } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { RelatedSession } from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { usePlayerUIContext } from '@/pages/Player/context/PlayerUIContext'
import { usePlayer } from '@/pages/Player/PlayerHook/PlayerHook'
import { SessionViewability } from '@/pages/Player/PlayerHook/PlayerState'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'
import {
	ReplayerContextProvider,
	ReplayerState,
	useReplayerContext,
} from '@/pages/Player/ReplayerContext'
import {
	ResourcesContextProvider,
	useResources,
} from '@/pages/Player/ResourcesContext/ResourcesContext'
import { NetworkResourcePanel } from '@/pages/Player/RightPlayerPanel/components/NetworkResourcePanel/NetworkResourcePanel'
import {
	SessionCurrentUrl,
	SessionViewportMetadata,
} from '@/pages/Player/SessionLevelBar/SessionLevelBarV2'
import SessionShareButtonV2 from '@/pages/Player/SessionShareButton/SessionShareButtonV2'
import { ManualStopCard, SessionFiller } from '@/pages/Player/SessionView'
import * as styles from '@/pages/Player/styles.css'
import DevToolsWindowV2 from '@/pages/Player/Toolbar/DevToolsWindowV2/DevToolsWindowV2'
import { Toolbar } from '@/pages/Player/Toolbar/Toolbar'
import useToolbarItems from '@/pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@/pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import { useResizePlayer } from '@/pages/Player/utils/utils'

export const SessionPanel: React.FC<{ resource: RelatedSession }> = ({
	resource,
}) => {
	const playerRef = useRef<HTMLDivElement>(null)
	const playerContext = usePlayer(playerRef, true)
	const { session } = playerContext
	const resourcesContext = useResources(session)
	const toolbarContext = useToolbarItems()

	return (
		<ReplayerContextProvider value={playerContext}>
			<ResourcesContextProvider value={resourcesContext}>
				<ToolbarItemsContextProvider value={toolbarContext}>
					<SessionPanelBase
						resource={resource}
						playerRef={playerRef}
					/>
				</ToolbarItemsContextProvider>
			</ResourcesContextProvider>
		</ReplayerContextProvider>
	)
}

const SessionPanelBase: React.FC<{
	resource: RelatedSession
	playerRef: React.RefObject<HTMLDivElement>
}> = ({ resource, playerRef }) => {
	const { projectId } = useNumericProjectId()
	const playerWrapperRef = useRef<HTMLDivElement>(null)
	const {
		session,
		state: replayerState,
		isLoadingEvents,
		isPlayerReady,
		replayer,
		sessionViewability,
		setScale,
	} = useReplayerContext()
	const replayerWrapperBbox = replayer?.wrapper.getBoundingClientRect()
	const { playerCenterPanelRef } = usePlayerUIContext()

	const { resizeListener, centerColumnResizeListener, controllerWidth } =
		useResizePlayer(replayer, playerWrapperRef, setScale)

	const path = useMemo(() => {
		const params = {
			[PlayerSearchParameters.errorId]: resource.errorId,
			[PlayerSearchParameters.log]: resource.log,
		}

		const filteredParams = Object.fromEntries(
			Object.entries(params).filter(([_, value]) => value !== undefined),
		)

		const paramsString = stringify(filteredParams)

		return `/${projectId}/sessions/${resource.secureId}?${paramsString}`
	}, [projectId, resource.errorId, resource.log, resource.secureId])

	const showSession = sessionViewability === SessionViewability.VIEWABLE

	return (
		<>
			<Panel.Header path={path}>
				<Stack
					justify="space-between"
					align="center"
					flexGrow={1}
					direction="row"
					overflow="hidden"
					gap="4"
				>
					<Stack
						align="center"
						direction="row"
						flexGrow={1}
						overflow="hidden"
					>
						<SessionViewportMetadata />
						<SessionCurrentUrl />
					</Stack>

					<SessionShareButtonV2 />
					<Panel.HeaderDivider />
				</Stack>
			</Panel.Header>

			<Box
				display="flex"
				flexDirection="column"
				width="full"
				height="full"
				id="playerCenterPanel"
				ref={playerCenterPanelRef}
			>
				{showSession ? (
					<Box height="full" cssClass={styles.playerBody}>
						<div className={styles.playerCenterColumn}>
							{centerColumnResizeListener}
							<Box
								display="flex"
								flexDirection="column"
								flexGrow={1}
							>
								<div
									className={clsx(styles.rrwebPlayerWrapper, {
										[styles.blurBackground]:
											isLoadingEvents && isPlayerReady,
									})}
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
										ref={playerRef}
									/>
									{!isPlayerReady && <LoadingBox />}
								</div>
								<Toolbar width={controllerWidth} />
							</Box>
							<DevToolsWindowV2 width={controllerWidth} />
						</div>
						<NetworkResourcePanel />
					</Box>
				) : (
					<SessionFiller
						sessionViewability={sessionViewability}
						session={session}
					/>
				)}
			</Box>
		</>
	)
}
