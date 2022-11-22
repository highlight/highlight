import {
	cmdKey,
	DevToolsShortcut,
	ShortcutItem,
	TimelineShortcut,
} from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Popover from '@components/Popover/Popover'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Switch from '@components/Switch/Switch'
import {
	Badge,
	Box,
	ButtonIcon,
	IconArrowsExpand,
	IconArrowSmDown,
	IconArrowSmLeft,
	IconArrowSmRight,
	IconArrowSmUp,
	IconChartBar,
	IconCog,
	IconPause,
	IconPlay,
	IconRestart,
	IconSkipLeft,
	IconSkipRight,
	IconTerminal,
	SwitchButton,
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
import usePlayerConfiguration, {
	PLAYBACK_SPEED_OPTIONS,
} from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import {
	ReplayerPausedStates,
	ReplayerState,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import SessionToken from '@pages/Player/SessionLevelBar/SessionToken/SessionToken'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings'
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import analytics from '@util/analytics'
import { clamp } from '@util/numbers'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import clsx from 'clsx'
import React from 'react'
import { useState } from 'react'

import timelinePopoverStyle from '../TimelineIndicators/TimelinePopover/TimelinePopover.module.scss'
import style from './ToolbarControlBar.module.scss'

const EventTypeToExclude: readonly string[] = ['Web Vitals']

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
		playerSpeedIdx,
		setPlayerSpeedIdx,
		showPlayerAbsoluteTime,
	} = usePlayerConfiguration()

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
				<ButtonIcon
					onClick={() => {
						analytics.track('PlayerSkipLeft')
						const prevTime = Math.max(time - 5000, 0)
						setTime(prevTime)
					}}
					disabled={disableControls}
					icon={<IconSkipLeft size={14} />}
					size="small"
					shape="square"
					emphasis="low"
					kind="secondary"
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
				<ButtonIcon
					onClick={() => {
						analytics.track('Player Play/Pause Button')
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
					icon={
						isPaused && isPlaybackComplete ? (
							<IconRestart size={14} />
						) : isPaused && !isLiveMode ? (
							<IconPlay size={14} />
						) : (
							<IconPause size={14} />
						)
					}
					size="small"
					shape="square"
					emphasis="low"
					kind="secondary"
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
				<ButtonIcon
					onClick={() => {
						analytics.track('PlayerSkipRight')
						const newTime = Math.max(time + 5000, 0)
						setTime(newTime)
					}}
					disabled={disableControls}
					icon={<IconSkipRight size={14} />}
					size="small"
					shape="square"
					emphasis="low"
					kind="secondary"
				/>
			</ExplanatoryPopover>
			{showLiveToggle && (
				<Tag
					onClick={() => {
						setIsLiveMode((isLive) => !isLive)
					}}
					kind={isLiveMode ? 'primary' : 'grey'}
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
					<ExplanatoryPopover
						className={style.moveRight}
						content={
							<>
								<Text userSelect="none" color="neutral500">
									Speed +/-
								</Text>
								<Box display="flex" gap="2">
									<Badge
										variant="grey"
										size="tiny"
										label={cmdKey}
									/>
									<Badge
										variant="grey"
										size="tiny"
										iconStart={<IconArrowSmUp size={12} />}
										label="/"
										iconEnd={<IconArrowSmDown size={12} />}
									/>
								</Box>
							</>
						}
					>
						<Tag
							kind="grey"
							onClick={() => {
								setPlayerSpeedIdx(playerSpeedIdx + 1)
							}}
							disabled={disableControls}
						>
							{PLAYBACK_SPEED_OPTIONS[playerSpeedIdx]}x
						</Tag>
					</ExplanatoryPopover>

					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="neutral500">
									Timeline
								</Text>
								<ShortcutTextGuide
									shortcut={TimelineShortcut}
								/>
							</>
						}
					>
						<SwitchButton
							onChange={() => {
								setShowHistogram(!showHistogram)
							}}
							checked={showHistogram}
							disabled={isPlayerFullscreen || disableControls}
							iconLeft={<IconChartBar size={14} />}
						/>
					</ExplanatoryPopover>
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="neutral500">
									Dev tools
								</Text>
								<ShortcutTextGuide
									shortcut={DevToolsShortcut}
								/>
							</>
						}
					>
						<SwitchButton
							onChange={() => {
								setShowDevTools(!showDevTools)
							}}
							checked={showDevTools}
							disabled={isPlayerFullscreen || disableControls}
							iconLeft={<IconTerminal size={14} />}
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
							<ButtonIcon
								disabled={disableControls}
								icon={<IconCog size={14} />}
								size="small"
								shape="square"
								emphasis="low"
								kind="secondary"
							/>
						</Box>
					</Popover>
				</>
			)}
			<Box cssClass={{ [style.moveRight]: isLiveMode }}>
				<ButtonIcon
					onClick={() => {
						setIsPlayerFullscreen((prev) => !prev)
					}}
					icon={<IconArrowsExpand size={14} />}
					size="small"
					shape="square"
					emphasis="low"
					kind="secondary"
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
				className={style.settingsButton}
				onClick={() => setShowHistogram(!showHistogram)}
			>
				<IconChartBar />
				Timeline
				<ShortcutTextGuide
					shortcut={TimelineShortcut}
					className={style.moveRight}
				/>
				<Switch
					trackingId="HistogramMenuToggle"
					checked={showHistogram}
					onChange={(checked: boolean) => {
						setShowHistogram(checked)
					}}
				/>
			</button>

			<button
				className={style.settingsButton}
				onClick={() => setShowDevTools(!showDevTools)}
			>
				<IconTerminal />
				Dev tools
				<ShortcutTextGuide
					shortcut={DevToolsShortcut}
					className={style.moveRight}
				/>
				<Switch
					trackingId="DevToolsMenuToggle"
					checked={showDevTools}
					onChange={(checked: boolean) => {
						setShowDevTools(checked)
					}}
				/>
			</button>

			<button
				className={style.settingsButton}
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
				className={style.settingsButton}
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
				className={style.settingsButton}
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
				className={style.settingsButton}
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
			<button key={idx} className={style.settingsButton}>
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
						className={clsx([
							style.leftClickActionName,
							style.moveRight,
						])}
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

type ShortcutGuideProps = {
	shortcut: ShortcutItem
	className?: string
}
const ShortcutTextGuide: React.FC<ShortcutGuideProps> = React.memo(
	({ shortcut, className }) => {
		return (
			<Box display="flex" gap="2" cssClass={className}>
				{shortcut.shortcut.map((char, idx) => (
					<Badge key={idx} variant="grey" size="tiny" label={char} />
				))}
			</Box>
		)
	},
)

export default ToolbarControls
