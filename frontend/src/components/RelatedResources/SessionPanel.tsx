import { Box } from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useCallback, useEffect, useRef } from 'react'
import useResizeAware from 'react-resize-aware'
import { Replayer } from 'rrweb'

import LoadingBox from '@/components/LoadingBox'
import { RelatedSession } from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { usePlayer } from '@/pages/Player/PlayerHook/PlayerHook'
import { ManualStopCard } from '@/pages/Player/PlayerPage'
import {
	ReplayerContextProvider,
	ReplayerState,
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
import * as styles from '@/pages/Player/styles.css'
import DevToolsWindowV2 from '@/pages/Player/Toolbar/DevToolsWindowV2/DevToolsWindowV2'
import { Toolbar } from '@/pages/Player/Toolbar/Toolbar'
import useToolbarItems from '@/pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@/pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'

export const SessionPanel: React.FC<{ resource: RelatedSession }> = ({
	resource,
}) => {
	const { projectId } = useNumericProjectId()
	const path = `/${projectId}/sessions/${resource.secureId}`
	const [centerColumnResizeListener, centerColumnSize] = useResizeAware()
	const playerContext = usePlayer()
	const {
		session,
		state: replayerState,
		isLoadingEvents,
		isPlayerReady,
		replayer,
		setScale,
	} = playerContext
	const resourcesContext = useResources(session)
	const toolbarContext = useToolbarItems()
	const playerWrapperRef = useRef<HTMLDivElement>(null)
	const replayerWrapperBbox = replayer?.wrapper.getBoundingClientRect()

	// START: Copied logic from PlayerPage
	const controllerWidth = centerColumnSize.width
		? Math.max(styles.MIN_CENTER_COLUMN_WIDTH, centerColumnSize.width ?? 0)
		: 0

	const resizePlayer = useCallback(
		(replayer: Replayer): boolean => {
			const width = replayer?.wrapper?.getBoundingClientRect().width
			const height = replayer?.wrapper?.getBoundingClientRect().height
			const targetWidth = playerWrapperRef.current?.clientWidth
			const targetHeight = playerWrapperRef.current?.clientHeight
			if (!targetWidth || !targetHeight) {
				return false
			}
			const widthScale = (targetWidth - styles.PLAYER_PADDING_X) / width
			const heightScale =
				(targetHeight - styles.PLAYER_PADDING_Y) / height
			let scale = Math.min(heightScale, widthScale)
			// If calculated scale is close enough to 1, return to avoid
			// infinite looping caused by small floating point math differences
			if (scale >= 0.9999 && scale <= 1.0001) {
				return false
			}

			let retry = false
			if (scale <= 0 || !Number.isFinite(scale)) {
				retry = true
				scale = 1
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
					`replayer-wrapper ${styles.rrwebInnerWrapper}`,
				)

				return replayerScale
			})
			return !retry
		},
		[setScale],
	)

	const playerBoundingClientRectWidth =
		replayer?.wrapper?.getBoundingClientRect().width
	const playerBoundingClientRectHeight =
		replayer?.wrapper?.getBoundingClientRect().height

	const [resizeListener, sizes] = useResizeAware()
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
	// END: Copied logic from PlayerPage

	return (
		<ReplayerContextProvider value={playerContext}>
			<ResourcesContextProvider value={resourcesContext}>
				<ToolbarItemsContextProvider value={toolbarContext}>
					<Panel.Header path={path}>
						<SessionViewportMetadata />
						<SessionCurrentUrl />
					</Panel.Header>

					<Box
						display="flex"
						flexDirection="column"
						width="full"
						height="full"
					>
						<Box height="full" cssClass={styles.playerBody}>
							<div className={styles.playerCenterColumn}>
								{centerColumnResizeListener}
								<Box
									display="flex"
									flexDirection="column"
									flexGrow={1}
								>
									<div
										className={clsx(
											styles.rrwebPlayerWrapper,
											{
												[styles.blurBackground]:
													isLoadingEvents &&
													isPlayerReady,
											},
										)}
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
										{!isPlayerReady && <LoadingBox />}
									</div>
									<Toolbar width={controllerWidth} />
								</Box>
								<DevToolsWindowV2 width={controllerWidth} />
							</div>
							<NetworkResourcePanel />
						</Box>
					</Box>
				</ToolbarItemsContextProvider>
			</ResourcesContextProvider>
		</ReplayerContextProvider>
	)
}
