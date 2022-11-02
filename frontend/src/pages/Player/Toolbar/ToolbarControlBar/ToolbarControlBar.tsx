import Popover from '@components/Popover/Popover'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Switch from '@components/Switch/Switch'
import {
	Badge,
	Box,
	BoxSwitch,
	Button,
	IconArrowsExpand,
	IconArrowSmLeft,
	IconArrowSmRight,
	IconChartBar,
	IconCog,
	IconPause,
	IconPlay,
	IconRestart,
	IconSkipLeft,
	IconSkipRight,
	IconTerminal,
	Tag,
	Text,
} from '@highlight-run/ui'
import ActivityIcon from '@icons/ActivityIcon'
import { ReactComponent as AnnotationIcon } from '@icons/Solid/annotation.svg'
import { ReactComponent as ChevronLeftIcon } from '@icons/Solid/cheveron-left.svg'
import { ReactComponent as ChevronRightIcon } from '@icons/Solid/cheveron-right.svg'
import { ReactComponent as CrossIcon } from '@icons/Solid/cross.svg'
import { ReactComponent as CursorClickIcon } from '@icons/Solid/cursor-click.svg'
import { ReactComponent as FastForwardIcon } from '@icons/Solid/fast-forward.svg'
import { ReactComponent as PlayCircleIcon } from '@icons/Solid/play-circle.svg'
import {
	getFullScreenPopoverGetPopupContainer,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ReplayerPausedStates,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import SessionToken from '@pages/Player/SessionLevelBar/SessionToken/SessionToken'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { clamp } from '@util/numbers'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import classNames from 'classnames'
import { H } from 'highlight.run'
import { useState } from 'react'

import timelinePopoverStyle from '../TimelineIndicators/TimelinePopover/TimelinePopover.module.scss'
import style from './ToolbarControlBar.module.scss'
const PLAYBACK_SPEED_OPTIONS: readonly number[] = [1, 2, 4, 8]
const EventTypeToExclude: readonly string[] = ['Web Vitals']

const isOnMac = window.navigator.platform.includes('Mac')

const showTimelineShortcut = 'E'
const showDevToolsShortcut = '/'

const ToolbarControls = () => {
	const {
		setTime,
		time,
		state,
		play,
		pause,
		canViewSession,
		isLiveMode,
		setIsLiveMode,
		session,
		sessionStartDateTime,
		sessionMetadata,
		lastActiveString,
	} = useReplayerContext()
	const { setIsPlayerFullscreen, isPlayerFullscreen } = usePlayerUIContext()

	const {
		showHistogram,
		setShowHistogram,
		showDevTools,
		setShowDevTools,
		playerSpeed,
		setPlayerSpeed,
		showPlayerAbsoluteTime,
	} = usePlayerConfiguration()

	const [playerSpeedIdx, setPlayerSpeedIdx] = useState<number>(
		Math.max(PLAYBACK_SPEED_OPTIONS.indexOf(playerSpeed), 0),
	)

	const isPaused = ReplayerPausedStates.includes(state)
	const sessionDuration = sessionMetadata.totalTime ?? 0
	const isPlaybackComplete = time >= sessionDuration && !isLiveMode

	const disableControls = state === ReplayerState.Loading || !canViewSession
	const showLiveToggle = session?.processed === false && !disableControls

	const [showSettings, setShowSettings] = useState(false)

	return (
		<div className={style.controlContainer}>
			<ExplanatoryPopover
				content={
					<>
						<Text userSelect="none" color="neutral500">
							Skip back
						</Text>
						<Badge
							variant="grey"
							size="tiny"
							iconStart={<IconArrowSmLeft size={12} />}
						/>
					</>
				}
			>
				<Button
					onClick={() => {
						H.track('PlayerSkipLeft')
						const prevTime = Math.max(time - 5000, 0)
						setTime(prevTime)
					}}
					disabled={disableControls}
					iconLeft={<IconSkipLeft size={14} />}
					variant="white"
				/>
			</ExplanatoryPopover>
			<ExplanatoryPopover
				content={
					<>
						<Text userSelect="none" color="neutral500">
							{isPlaybackComplete
								? 'Restart'
								: isPaused && !isLiveMode
								? 'Play'
								: 'Pause'}
						</Text>
						<Badge variant="grey" size="tiny" label="Space" />
					</>
				}
			>
				<Button
					onClick={() => {
						H.track('Player Play/Pause Button')
						if (isPlaybackComplete) {
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
					iconLeft={
						isPaused && isPlaybackComplete ? (
							<IconRestart size={14} />
						) : isPaused && !isLiveMode ? (
							<IconPlay size={14} />
						) : (
							<IconPause size={14} />
						)
					}
					variant="white"
				/>
			</ExplanatoryPopover>
			<ExplanatoryPopover
				content={
					<>
						<Text userSelect="none" color="neutral500">
							Skip forward
						</Text>
						<Badge
							variant="grey"
							size="tiny"
							iconStart={<IconArrowSmRight size={12} />}
						/>
					</>
				}
			>
				<Button
					onClick={() => {
						H.track('PlayerSkipRight')
						const newTime = Math.max(time + 5000, 0)
						setTime(newTime)
					}}
					disabled={disableControls}
					iconLeft={<IconSkipRight size={14} />}
					variant="white"
				/>
			</ExplanatoryPopover>
			{showLiveToggle && (
				<Tag
					onClick={() => {
						setIsLiveMode((isLive) => !isLive)
					}}
					variant={isLiveMode ? 'primary' : 'grey'}
					disabled={disableControls}
				>
					Live
				</Tag>
			)}
			{isLiveMode && lastActiveString && (
				<SessionToken
					className={style.liveUserStatus}
					icon={<ActivityIcon />}
					tooltipTitle={`This session is live, but the user was last active ${lastActiveString}.`}
				>
					User was last active {lastActiveString}
				</SessionToken>
			)}
			{!isLiveMode && (
				<>
					<Text color="neutral500" userSelect="none">
						{disableControls ? (
							<Skeleton count={1} width="60.13px" />
						) : showPlayerAbsoluteTime ? (
							<>
								{playerTimeToSessionAbsoluteTime({
									sessionStartTime: sessionStartDateTime,
									relativeTime: time,
								})}
								&nbsp;/&nbsp;
								{playerTimeToSessionAbsoluteTime({
									sessionStartTime: sessionStartDateTime,
									relativeTime: sessionDuration,
								})}
							</>
						) : (
							<>
								{MillisToMinutesAndSeconds(
									//     Sometimes the replayer will report a higher time when the player has ended.
									clamp(time, 0, sessionDuration),
								)}
								<>
									&nbsp;/&nbsp;
									{MillisToMinutesAndSeconds(sessionDuration)}
								</>
							</>
						)}
					</Text>
					<Tag
						variant="grey"
						className={style.moveRight}
						onClick={() => {
							const idx =
								(playerSpeedIdx + 1) %
								PLAYBACK_SPEED_OPTIONS.length
							setPlayerSpeedIdx(idx)
							setPlayerSpeed(PLAYBACK_SPEED_OPTIONS[idx])
						}}
						disabled={disableControls}
					>
						{playerSpeed}x
					</Tag>

					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="neutral500">
									Timeline
								</Text>
								<Box display="flex" gap="2">
									<Badge
										variant="grey"
										size="tiny"
										label={isOnMac ? '⌘' : 'Ctrl'}
									/>
									<Badge
										variant="grey"
										size="tiny"
										label={showTimelineShortcut}
									/>
								</Box>
							</>
						}
					>
						<BoxSwitch
							onChange={() => {
								setShowHistogram(!showHistogram)
							}}
							checked={showHistogram}
							disabled={disableControls}
							icon={<IconChartBar size={14} />}
						/>
					</ExplanatoryPopover>
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="neutral500">
									Dev tools
								</Text>
								<span className={style.popoverCmdShortcut}>
									{showDevToolsShortcut}
								</span>
							</>
						}
						height="28px"
					>
						<BoxSwitch
							onChange={() => {
								setShowDevTools(!showDevTools)
							}}
							checked={showDevTools}
							disabled={isPlayerFullscreen || disableControls}
							icon={<IconTerminal size={14} />}
						/>
					</ExplanatoryPopover>
					<Popover
						getPopupContainer={
							getFullScreenPopoverGetPopupContainer
						}
						content={
							<ControlSettings
								setShowSettingsPopover={setShowSettings}
							/>
						}
						overlayClassName={style.settingsPopoverOverlay}
						placement="topRight"
						trigger="click"
						showArrow={false}
						align={{
							overflow: {
								adjustY: false,
								adjustX: false,
							},
							offset: [0, 8],
						}}
						onVisibleChange={(visible) => {
							setShowSettings(visible)
						}}
						visible={showSettings}
						destroyTooltipOnHide
					>
						<Box>
							<Button
								disabled={disableControls}
								variant="white"
								iconLeft={<IconCog size={14} />}
							/>
						</Box>
					</Popover>
				</>
			)}
			<Box cssClass={{ [style.moveRight]: isLiveMode }}>
				<Button
					onClick={() => {
						setIsPlayerFullscreen((prev) => !prev)
					}}
					iconLeft={<IconArrowsExpand size={14} />}
					variant="white"
				/>
			</Box>
		</div>
	)
}

interface ControlSettingsProps {
	setShowSettingsPopover: (shouldShow: boolean) => void
}
const ControlSettings = ({ setShowSettingsPopover }: ControlSettingsProps) => {
	const [showSessionSettings, setShowSessionSettings] = useState(true)
	const {
		showHistogram,
		setShowHistogram,
		showDevTools,
		setShowDevTools,
		skipInactive,
		setSkipInactive,
		showPlayerMouseTail,
		setShowPlayerMouseTail,
		autoPlayVideo,
		setAutoPlayVideo,
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()

	const options = (
		<>
			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setShowHistogram(!showHistogram)}
			>
				<IconChartBar />
				Timeline
				<span
					className={classNames(
						style.settingsOptionShortcut,
						style.moveRight,
					)}
				>
					{showTimelineShortcut}
				</span>
				<Switch
					trackingId="HistogramMenuToggle"
					checked={showHistogram}
					onChange={(checked: boolean) => {
						setShowHistogram(checked)
					}}
				/>
			</button>

			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setShowDevTools(!showDevTools)}
			>
				<IconTerminal />
				Dev tools
				<span
					className={classNames(
						style.settingsOptionShortcut,
						style.moveRight,
					)}
				>
					{showDevToolsShortcut}
				</span>
				<Switch
					trackingId="DevToolsMenuToggle"
					checked={showDevTools}
					onChange={(checked: boolean) => {
						setShowDevTools(checked)
					}}
				/>
			</button>

			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setShowPlayerMouseTail(!showPlayerMouseTail)}
			>
				<CursorClickIcon />
				Mouse trail
				<Switch
					trackingId="MouseTrailMenuToggle"
					checked={showPlayerMouseTail}
					onChange={(checked: boolean) => {
						setShowPlayerMouseTail(checked)
					}}
					className={style.moveRight}
				/>
			</button>

			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setSkipInactive(!skipInactive)}
			>
				<FastForwardIcon />
				Skip inactive
				<Switch
					trackingId="SkipInactiveMenuToggle"
					checked={skipInactive}
					onChange={(checked: boolean) => {
						setSkipInactive(checked)
					}}
					className={style.moveRight}
				/>
			</button>

			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setAutoPlayVideo(!autoPlayVideo)}
			>
				<PlayCircleIcon />
				Autoplay
				<Switch
					trackingId="AutoplayVideoMenuToggle"
					checked={autoPlayVideo}
					onChange={(checked: boolean) => {
						setAutoPlayVideo(checked)
					}}
					className={style.moveRight}
				/>
			</button>

			<button
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
				onClick={() => setShowSessionSettings(false)}
			>
				<AnnotationIcon />
				Annotations
				<ChevronRightIcon className={style.moveRight} />
			</button>
		</>
	)

	const shownEventTypes = EventsForTimeline.filter(
		(eventType) => !EventTypeToExclude.includes(eventType),
	)
	const annotations = shownEventTypes.map((eventType, idx) => {
		const color = `var(${getAnnotationColor(eventType)})`
		const name = getTimelineEventDisplayName(eventType)
		const onChecked = (checked: boolean) => {
			if (checked) {
				setSelectedTimelineAnnotationTypes([
					...selectedTimelineAnnotationTypes,
					eventType,
				])
			} else {
				setSelectedTimelineAnnotationTypes(
					selectedTimelineAnnotationTypes.filter(
						(type) => type !== eventType,
					),
				)
			}
		}

		let onLeftClickActionName = 'Only'
		if (selectedTimelineAnnotationTypes.includes(eventType)) {
			if (selectedTimelineAnnotationTypes.length === 1) {
				onLeftClickActionName = 'All'
			}
		}

		return (
			<button
				key={idx}
				className={classNames(
					style.settingsButton,
					style.settingsOption,
				)}
			>
				<div
					className={style.leftSelection}
					onClick={() => {
						if (
							selectedTimelineAnnotationTypes.includes(eventType)
						) {
							if (
								selectedTimelineAnnotationTypes.length ===
								shownEventTypes.length
							) {
								setSelectedTimelineAnnotationTypes([eventType])
							} else if (
								selectedTimelineAnnotationTypes.length === 1
							) {
								setSelectedTimelineAnnotationTypes(
									shownEventTypes,
								)
							} else {
								setSelectedTimelineAnnotationTypes([eventType])
							}
						} else {
							setSelectedTimelineAnnotationTypes([eventType])
						}
					}}
				>
					<span
						className={timelinePopoverStyle.eventTypeIcon}
						style={{ background: color }}
					/>
					<span>{name}</span>
					<span
						className={classNames(
							style.leftClickActionName,
							style.moveRight,
						)}
					>
						{onLeftClickActionName}
					</span>
				</div>
				<Switch
					trackingId={`${eventType}AnnotationToggle`}
					checked={selectedTimelineAnnotationTypes.includes(
						eventType,
					)}
					onChange={onChecked}
					className={style.moveRight}
				/>
			</button>
		)
	})
	return (
		<div className={style.settingsContainer}>
			<div
				className={style.section}
				onClick={() => {
					if (showSessionSettings) {
						setShowSettingsPopover(false)
					} else {
						setShowSessionSettings(true)
					}
				}}
			>
				<button className={style.settingsButton}>
					{showSessionSettings ? (
						<>
							<CrossIcon />
							<span>Close</span>{' '}
						</>
					) : (
						<>
							<ChevronLeftIcon />
							<span>Back to session settings</span>
						</>
					)}
				</button>
			</div>
			<div className={style.section}>
				{showSessionSettings ? options : annotations}
			</div>
		</div>
	)
}

export default ToolbarControls
