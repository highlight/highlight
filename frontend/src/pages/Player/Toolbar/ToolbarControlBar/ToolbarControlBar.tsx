import {
	cmdKey,
	DevToolsShortcut,
	ShortcutTextGuide,
	TimelineShortcut,
} from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import Popover from '@components/Popover/Popover'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Switch from '@components/Switch/Switch'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidArrowsExpand,
	IconSolidArrowSmDown,
	IconSolidArrowSmLeft,
	IconSolidArrowSmUp,
	IconSolidChartBar,
	IconSolidClock,
	IconSolidCog,
	IconSolidPause,
	IconSolidPlay,
	IconSolidRefresh,
	IconSolidSkip,
	IconSolidSkipLeft,
	IconSolidTerminal,
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
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
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

export const ToolbarControlBar = () => {
	const {
		setTime,
		time,
		state,
		play,
		pause,
		canViewSession,
		isPlayerReady,
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

	const disableControls =
		state === ReplayerState.Loading || !canViewSession || !isPlayerReady
	const showLiveToggle = session?.processed === false && !disableControls

	const [showSettings, setShowSettings] = useState(false)

	return (
		<Box
			display="flex"
			alignItems="center"
			width="full"
			gap="4"
			px="8"
			py="4"
			overflow="hidden"
		>
			<Box display="flex" gap="2">
				<ExplanatoryPopover
					content={
						<>
							<Text userSelect="none" color="n11">
								Skip back
							</Text>
							<Badge
								variant="gray"
								size="small"
								iconStart={<IconSolidArrowSmLeft />}
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
						icon={<IconSolidSkipLeft />}
						size="xSmall"
						shape="square"
						emphasis="low"
						kind="secondary"
					/>
				</ExplanatoryPopover>
				<ExplanatoryPopover
					content={
						<>
							<Text userSelect="none" color="n11">
								{isPlaybackComplete
									? 'Restart'
									: isPaused && !isLiveMode
									? 'Play'
									: 'Pause'}
							</Text>
							<Badge variant="gray" size="small" label="Space" />
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
								<IconSolidRefresh />
							) : isPaused && !isLiveMode ? (
								<IconSolidPlay />
							) : (
								<IconSolidPause />
							)
						}
						size="xSmall"
						shape="square"
						emphasis="low"
						kind="secondary"
					/>
				</ExplanatoryPopover>
				<ExplanatoryPopover
					content={
						<>
							<Text userSelect="none" color="n11">
								Skip forward
							</Text>
							<Badge
								variant="gray"
								size="small"
								iconStart={<IconSolidSkip size={12} />}
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
						icon={<IconSolidSkip size={14} />}
						size="xSmall"
						shape="square"
						emphasis="low"
						kind="secondary"
					/>
				</ExplanatoryPopover>
			</Box>

			{showLiveToggle && (
				<Tag
					onClick={() => {
						setIsLiveMode((isLive) => !isLive)
					}}
					shape="rounded"
					kind="primary"
					emphasis="high"
					disabled={disableControls}
					lines="1"
				>
					{isLiveMode ? 'Hide' : 'Show'} live mode
				</Tag>
			)}

			<Box display="flex" gap="4" ml="4">
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
					<Text color="n11" userSelect="none" lines="1">
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
									clamp(time ?? 0, 0, sessionDuration),
								)}
								<>
									&nbsp;/&nbsp;
									{MillisToMinutesAndSeconds(sessionDuration)}
								</>
							</>
						)}
					</Text>
				)}
			</Box>
			<Box
				display="flex"
				alignItems="center"
				cssClass={style.moveRight}
				gap="4"
			>
				{!isLiveMode && (
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="n11">
									Speed +/-
								</Text>
								<Box display="flex" gap="2">
									<Badge
										variant="gray"
										size="small"
										label={cmdKey}
									/>
									<Badge
										variant="gray"
										size="small"
										iconStart={
											<IconSolidArrowSmUp size={12} />
										}
										label="/"
										iconEnd={
											<IconSolidArrowSmDown size={12} />
										}
									/>
								</Box>
							</>
						}
					>
						<Tag
							kind="secondary"
							shape="rounded"
							size="medium"
							emphasis="low"
							onClick={() => {
								setPlayerSpeedIdx(playerSpeedIdx + 1)
							}}
							disabled={disableControls}
							lines="1"
						>
							{PLAYBACK_SPEED_OPTIONS[playerSpeedIdx]}x
						</Tag>
					</ExplanatoryPopover>
				)}

				{!isLiveMode && (
					<ExplanatoryPopover
						content={
							<>
								<Text userSelect="none" color="n11">
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
							iconLeft={<IconSolidChartBar size={14} />}
						/>
					</ExplanatoryPopover>
				)}

				<ExplanatoryPopover
					content={
						<>
							<Text userSelect="none" color="n11">
								Dev tools
							</Text>
							<ShortcutTextGuide shortcut={DevToolsShortcut} />
						</>
					}
				>
					<SwitchButton
						onChange={() => {
							setShowDevTools(!showDevTools)
						}}
						checked={showDevTools}
						disabled={isPlayerFullscreen || disableControls}
						iconLeft={<IconSolidTerminal size={14} />}
					/>
				</ExplanatoryPopover>

				<Popover
					getPopupContainer={getFullScreenPopoverGetPopupContainer}
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
					<ButtonIcon
						icon={<IconSolidCog />}
						disabled={disableControls}
						size="xSmall"
						shape="square"
						emphasis="low"
						kind="secondary"
					/>
				</Popover>

				<ButtonIcon
					onClick={() => {
						setIsPlayerFullscreen((prev) => !prev)
					}}
					disabled={disableControls}
					icon={<IconSolidArrowsExpand size={14} />}
					size="xSmall"
					shape="square"
					emphasis="low"
					kind="secondary"
				/>
			</Box>
		</Box>
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
		showPlayerAbsoluteTime,
		setShowPlayerAbsoluteTime,
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()

	const { isLiveMode } = useReplayerContext()
	const options = (
		<>
			<button
				className={style.settingsButton}
				onClick={() => setShowHistogram(!showHistogram)}
			>
				<IconSolidChartBar />
				<p>Timeline</p>
				<ShortcutTextGuide
					shortcut={TimelineShortcut}
					className={style.moveRight}
				/>
				<Switch
					trackingId="HistogramMenuToggle"
					checked={!isLiveMode && showHistogram}
					onChange={(checked: boolean) => {
						setShowHistogram(checked)
					}}
					disabled={isLiveMode}
				/>
			</button>

			<button
				className={style.settingsButton}
				onClick={() => setShowDevTools(!showDevTools)}
			>
				<IconSolidTerminal />
				<p>Dev tools</p>
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
				<p>Mouse trail</p>
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
				<p>Skip inactive</p>
				<Switch
					trackingId="SkipInactiveMenuToggle"
					checked={!isLiveMode && skipInactive}
					onChange={(checked: boolean) => {
						setSkipInactive(checked)
					}}
					className={style.moveRight}
					disabled={isLiveMode}
				/>
			</button>

			<button
				className={style.settingsButton}
				onClick={() => setAutoPlayVideo(!autoPlayVideo)}
			>
				<PlayCircleIcon />
				<p>Autoplay</p>
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
				onClick={() =>
					setShowPlayerAbsoluteTime(!showPlayerAbsoluteTime)
				}
			>
				<IconSolidClock />
				<p>Absolute time</p>
				<Switch
					trackingId="PlayerAbsoluteTimeMenuToggle"
					checked={showPlayerAbsoluteTime}
					onChange={(checked: boolean) => {
						setShowPlayerAbsoluteTime(checked)
					}}
					className={style.moveRight}
				/>
			</button>

			<button
				className={style.settingsButton}
				onClick={() => setShowSessionSettings(false)}
			>
				<AnnotationIcon />
				<p>Annotations</p>
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
