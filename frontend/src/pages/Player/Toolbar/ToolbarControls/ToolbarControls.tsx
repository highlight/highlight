import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import { ReactComponent as ArrowsExpandIcon } from '@icons/Solid/arrows-expand.svg'
import { ReactComponent as ChartBarIcon } from '@icons/Solid/chart-bar.svg'
import { ReactComponent as CogIcon } from '@icons/Solid/cog.svg'
import { ReactComponent as FastForwardIcon } from '@icons/Solid/fast-forward.svg'
import { ReactComponent as PauseIcon } from '@icons/Solid/pause.svg'
import { ReactComponent as PlayIcon } from '@icons/Solid/play.svg'
import { ReactComponent as RestartIcon } from '@icons/Solid/restart.svg'
import { ReactComponent as SkipLeftIcon } from '@icons/Solid/skip-left.svg'
import { ReactComponent as SkipRightIcon } from '@icons/Solid/skip-right.svg'
import { ReactComponent as TerminalIcon } from '@icons/Solid/terminal.svg'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ReplayerPausedStates,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import classNames from 'classnames'
import { H } from 'highlight.run'
import { PropsWithChildren, useState } from 'react'

import style from './ToolbarControls.module.scss'

const PLAYBACK_SPEED_OPTIONS: readonly number[] = [1, 2, 4, 8]

const ToolbarControls = () => {
	const {
		replayer,
		setTime,
		time,
		state,
		play,
		pause,
		canViewSession,
		isPlayerReady,
		isLiveMode,
		setIsLiveMode,
		lastActiveString,
		session,
		sessionStartDateTime,
		sessionMetadata,
	} = useReplayerContext()
	const { setIsPlayerFullscreen, isPlayerFullscreen } = usePlayerUIContext()

	const {
		showHistogram,
		setShowHistogram,
		showDevTools,
		setShowDevTools,
		playerSpeed,
		setPlayerSpeed,
		skipInactive,
		setSkipInactive,
	} = usePlayerConfiguration()

	const isHistogramVisible = !isLiveMode && showHistogram

	const disableControls = state === ReplayerState.Loading || !canViewSession

	const [playerSpeedIdx, setPlayerSpeedIdx] = useState<number>(
		Math.max(PLAYBACK_SPEED_OPTIONS.indexOf(playerSpeed), 0),
	)

	const isPaused = ReplayerPausedStates.includes(state)
	const sessionDuration = sessionMetadata.totalTime ?? 0
	const disablePlayButton = time >= sessionDuration && !isLiveMode

	const showLiveToggle = session?.processed === false && !disableControls

	return (
		<div className={style.controlContainer}>
			<Button
				className={style.button}
				trackingId="PlayerSkipLeft"
				onClick={() => {
					H.track('PlayerSkipLeft')
					const prevTime = Math.max(time - 5000, 0)
					setTime(prevTime)
				}}
				disabled={disableControls}
			>
				<SkipLeftIcon />
			</Button>

			<Button
				className={style.button}
				trackingId="PlayerPlayPause"
				onClick={() => {
					H.track('Player Play/Pause Button')
					if (disablePlayButton) {
						pause(time)
						const newTime = 0
						play(newTime)
					} else if (isPaused && !isLiveMode) {
						play(time)
					} else {
						pause(time)
					}
				}}
				disabled={disableControls}
			>
				{isPaused && disablePlayButton ? (
					<RestartIcon />
				) : isPaused && !isLiveMode ? (
					<PlayIcon />
				) : (
					<PauseIcon />
				)}
			</Button>

			<Button
				className={style.button}
				trackingId="PlayerSkipRight"
				onClick={() => {
					H.track('PlayerSkipRight')
					const newTime = Math.max(time + 5000, 0)
					setTime(newTime)
				}}
				disabled={disableControls}
			>
				<SkipRightIcon />
			</Button>

			{showLiveToggle && (
				<Button
					className={classNames(style.button, style.smallButton, {
						[style.activeButton]: isLiveMode,
					})}
					trackingId="LiveToggle"
					onClick={() => {
						setIsLiveMode((isLive) => !isLive)
					}}
					disabled={disableControls}
				>
					Live
				</Button>
			)}

			<Button
				className={classNames(
					style.button,
					style.moveRight,
					style.smallButton,
				)}
				trackingId="PlaybackSpeedControl"
				onClick={() => {
					const idx =
						(playerSpeedIdx + 1) % PLAYBACK_SPEED_OPTIONS.length
					setPlayerSpeedIdx(idx)
					setPlayerSpeed(PLAYBACK_SPEED_OPTIONS[idx])
				}}
				disabled={disableControls}
			>
				{playerSpeed}x
			</Button>

			<ExplanatoryPopover
				content={
					<>
						Histogram
						<span className={style.popoverCmdShortcut}>⌘ T</span>
					</>
				}
			>
				<Button
					className={classNames(style.button, style.minorButton, {
						[style.activeButton]: isHistogramVisible,
					})}
					trackingId="HistogramToggle"
					onClick={() => {
						setShowHistogram(!showHistogram)
					}}
					disabled={isLiveMode || disableControls}
				>
					<ChartBarIcon />
				</Button>
			</ExplanatoryPopover>

			<ExplanatoryPopover
				content={
					<>
						Dev tools
						<span className={style.popoverCmdShortcut}>⌘ D</span>
					</>
				}
			>
				<Button
					className={classNames(style.button, style.minorButton, {
						[style.activeButton]: showDevTools,
					})}
					trackingId="DevToolsToggle"
					onClick={() => {
						setShowDevTools(!showDevTools)
					}}
					disabled={disableControls || isPlayerFullscreen}
				>
					<TerminalIcon />
				</Button>
			</ExplanatoryPopover>

			<ExplanatoryPopover content={<>Skip inactive</>}>
				<Button
					className={classNames(style.button, style.minorButton, {
						[style.activeButton]: skipInactive,
					})}
					trackingId="SkipInactiveToggle"
					onClick={() => {
						setSkipInactive(!skipInactive)
					}}
				>
					<FastForwardIcon />
				</Button>
			</ExplanatoryPopover>

			<Button
				className={style.button}
				trackingId="PlayerSettings"
				onClick={() => {}}
			>
				<CogIcon />
			</Button>

			<Button
				className={style.button}
				trackingId="PlayerFullscreen"
				onClick={() => {
					setIsPlayerFullscreen((prev) => !prev)
				}}
			>
				<ArrowsExpandIcon />
			</Button>
		</div>
	)
}

interface ExplanatoryPopoverProps {
	content: React.ReactNode
}
const ExplanatoryPopover = ({
	content,
	children,
}: PropsWithChildren<ExplanatoryPopoverProps>) => {
	return (
		<Popover
			content={content}
			overlayClassName={style.buttonPopoverOverlay}
			showArrow={false}
			align={{
				overflow: {
					adjustY: false,
					adjustX: false,
				},
				offset: [0, 8],
			}}
		>
			{children}
		</Popover>
	)
}
export default ToolbarControls
