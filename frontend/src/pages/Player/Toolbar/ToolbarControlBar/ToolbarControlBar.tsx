import EnterpriseFeatureButton from '@components/Billing/EnterpriseFeatureButton'
import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	cmdKey,
	DevToolsShortcut,
	ShortcutTextGuide,
	TimelineShortcut,
} from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { LinkButton } from '@components/LinkButton'
import Popover from '@components/Popover/Popover'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Switch from '@components/Switch/Switch'
import { toast } from '@components/Toaster'
import { useExportSessionMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	Badge,
	Box,
	ButtonIcon,
	IconSolidAnnotation,
	IconSolidArrowsExpand,
	IconSolidChartBar,
	IconSolidCheveronLeft,
	IconSolidCheveronRight,
	IconSolidClock,
	IconSolidCog,
	IconSolidCursorClick,
	IconSolidDownload,
	IconSolidFastForward,
	IconSolidPause,
	IconSolidPlay,
	IconSolidPlayCircle,
	IconSolidRefresh,
	IconSolidSkip,
	IconSolidSkipLeft,
	IconSolidTerminal,
	IconSolidX,
	Stack,
	SwitchButton,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
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
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar'
import { getTimelineEventDisplayName } from '@pages/Player/utils/utils'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { clamp } from '@util/numbers'
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import clsx from 'clsx'
import { useCallback, useState } from 'react'

import timelinePopoverStyle from '../TimelineIndicators/TimelinePopover/TimelinePopover.module.css'
import style from './ToolbarControlBar.module.css'

const EventTypeToExclude: readonly string[] = []

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
				<Tooltip
					trigger={
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
					}
					delayed
					disabled={disableControls}
				>
					<KeyboardShortcut label="Skip back" shortcut="←" />
				</Tooltip>
				<Tooltip
					trigger={
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
					}
					delayed
					disabled={disableControls}
				>
					<KeyboardShortcut
						label={
							isPlaybackComplete
								? 'Restart'
								: isPaused && !isLiveMode
								? 'Play'
								: 'Pause'
						}
						shortcut="Space"
					/>
				</Tooltip>
				<Tooltip
					trigger={
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
					}
					delayed
					disabled={disableControls}
				>
					<KeyboardShortcut label="Skip forward" shortcut="→" />
				</Tooltip>
			</Box>

			{showLiveToggle && (
				<Tag
					onClick={() => {
						setIsLiveMode(!isLiveMode)
					}}
					shape="rounded"
					kind={isLiveMode ? 'primary' : 'secondary'}
					emphasis={isLiveMode ? 'high' : 'medium'}
					disabled={disableControls}
					lines="1"
				>
					{isLiveMode ? 'Disable' : 'Enable'} live mode
				</Tag>
			)}

			<Box display="flex" gap="4" ml="4" alignItems="center">
				{isLiveMode && lastActiveString && (
					<Stack align="center" direction="row" gap="4">
						<Text size="xSmall" color="weak">
							Last activity
						</Text>
						<Badge
							iconStart={<IconSolidClock size={12} />}
							label={lastActiveString}
							variant="gray"
							size="small"
						/>
					</Stack>
				)}
				{!isLiveMode && (
					<Text color="weak" userSelect="none" lines="1">
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
					<>
						<Tooltip
							trigger={
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
							}
							delayed
							disabled={disableControls}
						>
							<KeyboardShortcut
								label="Speed +/-"
								shortcut={[cmdKey, '↑/↓']}
							/>
						</Tooltip>

						<Tooltip
							trigger={
								<SwitchButton
									onChange={() => {
										setShowHistogram(!showHistogram)
									}}
									checked={showHistogram}
									disabled={
										isPlayerFullscreen || disableControls
									}
									iconLeft={<IconSolidChartBar size={14} />}
								/>
							}
							delayed
							disabled={isPlayerFullscreen || disableControls}
						>
							<KeyboardShortcut
								label="Timeline"
								shortcut={TimelineShortcut.shortcut}
							/>
						</Tooltip>

						<Tooltip
							trigger={
								<SwitchButton
									onChange={() => {
										setShowDevTools(!showDevTools)
									}}
									checked={showDevTools}
									disabled={
										isPlayerFullscreen || disableControls
									}
									iconLeft={<IconSolidTerminal size={14} />}
								/>
							}
							delayed
							disabled={isPlayerFullscreen || disableControls}
						>
							<KeyboardShortcut
								label="Dev tools"
								shortcut={DevToolsShortcut.shortcut}
							/>
						</Tooltip>

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
							<ButtonIcon
								icon={<IconSolidCog />}
								disabled={disableControls}
								size="xSmall"
								shape="square"
								emphasis="low"
								kind="secondary"
							/>
						</Popover>
					</>
				)}

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
	const { projectId } = useProjectId()
	const [showSessionSettings, setShowSessionSettings] = useState(true)
	const { currentWorkspace } = useApplicationContext()
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
	const { session } = useReplayerContext()
	const [exportSessionMutation] = useExportSessionMutation()

	const exportSession = useCallback(async () => {
		if (session?.secure_id) {
			analytics.track('Session Export Requested', {
				sessionSecureId: session.secure_id,
				workspaceId: currentWorkspace?.id,
			})
			try {
				await exportSessionMutation({
					variables: {
						session_secure_id: session.secure_id,
					},
					refetchQueries: [namedOperations.Query.GetSessionExports],
				})
				await toast.info(
					'You will receive an email once the session is ready.',
					{
						duration: 10000,
						content: (
							<LinkButton
								to={`/${projectId}/settings/sessions#exports`}
								kind="secondary"
								emphasis="high"
								trackingId="session-export-check-progress"
							>
								Check progress
							</LinkButton>
						),
					},
				)
			} catch (e) {
				await toast.error(
					`An error occurred exporting the session: ${e}`,
				)
			}
		}
	}, [
		currentWorkspace?.id,
		exportSessionMutation,
		projectId,
		session?.secure_id,
	])

	const { isLiveMode } = useReplayerContext()
	const options = (
		<>
			<button
				className={style.settingsButton}
				onClick={() => setShowHistogram(!showHistogram)}
			>
				<IconSolidChartBar />
				<Text color="secondaryContentText">Timeline</Text>
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
				<Text color="secondaryContentText">Dev tools</Text>
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
				<IconSolidCursorClick />
				<Text color="secondaryContentText">Mouse trail</Text>
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
				<IconSolidFastForward />
				<Text color="secondaryContentText">Skip inactive</Text>
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
				<IconSolidPlayCircle />
				<Text color="secondaryContentText">Autoplay</Text>
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
				<Text color="secondaryContentText">Absolute time</Text>
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
				<IconSolidAnnotation />
				<Text color="secondaryContentText">Annotations</Text>
				<IconSolidCheveronRight className={style.moveRight} />
			</button>

			<EnterpriseFeatureButton
				setting="enable_session_export"
				name="Session Download"
				fn={exportSession}
				className={clsx(style.settingsButton, style.downloadButton)}
			>
				<IconSolidDownload size={16} />
				<Box
					color="secondaryContentText"
					display="inline-flex"
					alignItems="center"
					gap="6"
					flexGrow={1}
				>
					<Text lines="1">Download video</Text>
				</Box>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
				>
					<Badge size="small" label="Business" />
				</Box>
			</EnterpriseFeatureButton>
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
							<IconSolidX />
							<span>Close</span>{' '}
						</>
					) : (
						<>
							<IconSolidCheveronLeft />
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
