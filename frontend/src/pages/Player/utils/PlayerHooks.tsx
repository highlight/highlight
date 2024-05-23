import { toast } from '@components/Toaster'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import {
	changeSession,
	findNextSessionInList,
	findPreviousSessionInList,
} from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration, {
	PLAYBACK_SPEED_OPTIONS,
} from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import analytics from '@util/analytics'
import { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { useProjectId } from '@/hooks/useProjectId'
import { useSessionParams } from '@/pages/Sessions/utils'

import { ReplayerState, useReplayerContext } from '../ReplayerContext'

/**
 * The time to skip along the timeline. Used to skip X time back or forwards.
 */
export const PLAYER_SKIP_DURATION = 5000

export const getNewTimeWithSkip = ({
	direction,
	time,
	totalTime,
}: {
	time: number
	totalTime?: number
	direction: 'backwards' | 'forwards'
}) => {
	switch (direction) {
		case 'backwards':
			return Math.max(time - PLAYER_SKIP_DURATION, 0)
		case 'forwards':
			if (!!totalTime) {
				return Math.min(time + PLAYER_SKIP_DURATION, totalTime)
			}
			return time
		default:
			return time
	}
}

export const usePlayerKeyboardShortcuts = () => {
	const {
		state,
		play,
		pause,
		time,
		replayer,
		sessionResults,
		sessionMetadata,
	} = useReplayerContext()
	const { setIsPlayerFullscreen, setRightPanelView } = usePlayerUIContext()
	const {
		setPlayerSpeedIdx,
		playerSpeedIdx,
		setEnableInspectElement,
		setShowLeftPanel,
		showLeftPanel,
		showRightPanel,
		setShowRightPanel,
		setShowDevTools,
		showDevTools,
		setShowHistogram,
		showHistogram,
	} = usePlayerConfiguration()
	const { projectId } = useProjectId()
	const { sessionSecureId } = useSessionParams()
	const navigate = useNavigate()

	/**
	 * This function needs to be called before each hot key.
	 * This moves the window's focus from any interactable elements to the window.
	 * Without this, undefined behavior will occur.
	 * Example: If the user clicks a button, then presses space, space will trigger the default action on the button and also the space hotkey.
	 */
	const moveFocusToDocument = (e: KeyboardEvent) => {
		e.stopPropagation()
		e.preventDefault()
		window.focus()

		if (
			document.activeElement &&
			document.activeElement instanceof HTMLElement
		) {
			document.activeElement.blur()
		}
	}

	useHotkeys(
		'space',
		(e) => {
			if (replayer) {
				analytics.track('PlayerPausePlayKeyboardShortcut')
				moveFocusToDocument(e)

				switch (state) {
					case ReplayerState.Playing:
						pause(time)
						break
					case ReplayerState.Paused:
					case ReplayerState.LoadedAndUntouched:
					case ReplayerState.LoadedWithDeepLink:
						play(time)
						break
					case ReplayerState.Loading:
					case ReplayerState.SessionRecordingStopped:
						break
					case ReplayerState.SessionEnded:
						play(0)
				}
			}
		},
		[state, time, pause, play],
	)

	useHotkeys(
		'left',
		(e) => {
			if (replayer) {
				analytics.track('PlayerSkipBackwardsKeyboardShortcut')
				moveFocusToDocument(e)

				const newTime = getNewTimeWithSkip({
					time,
					direction: 'backwards',
				})

				switch (state) {
					case ReplayerState.Playing:
						play(newTime)
						break
					case ReplayerState.Paused:
					case ReplayerState.LoadedAndUntouched:
					case ReplayerState.LoadedWithDeepLink:
					case ReplayerState.SessionEnded:
						pause(newTime)
						break
					case ReplayerState.Loading:
					case ReplayerState.SessionRecordingStopped:
						break
				}
			}
		},
		[time, state, pause, play],
	)

	useHotkeys(
		'right',
		(e) => {
			if (replayer) {
				analytics.track('PlayerSkipForwardsKeyboardShortcut')
				moveFocusToDocument(e)

				const totalTime = sessionMetadata.totalTime
				const newTime = getNewTimeWithSkip({
					time,
					direction: 'forwards',
					totalTime,
				})

				switch (state) {
					case ReplayerState.Playing:
						play(newTime)
						break
					case ReplayerState.Paused:
					case ReplayerState.LoadedAndUntouched:
					case ReplayerState.LoadedWithDeepLink:
						pause(newTime)
						break
					case ReplayerState.Loading:
					case ReplayerState.SessionRecordingStopped:
						break
				}
			}
		},
		[time, replayer, state, pause, play],
	)

	useHotkeys(
		'shift+n',
		(e) => {
			if (sessionResults.sessions.length > 0 && !!sessionSecureId) {
				analytics.track('PlayerSkipToNextSessionKeyboardShortcut')
				moveFocusToDocument(e)

				const nextSession = findNextSessionInList(
					sessionResults.sessions,
					sessionSecureId,
				)
				changeSession(
					projectId!,
					navigate,
					nextSession,
					'Playing the next session.',
				)
			}
		},
		[sessionSecureId, sessionResults.sessions],
	)

	useHotkeys(
		'shift+p',
		(e) => {
			if (sessionResults.sessions.length > 0 && !!sessionSecureId) {
				analytics.track('PlayerSkipToPreviousSessionKeyboardShortcut')
				moveFocusToDocument(e)

				const nextSession = findPreviousSessionInList(
					sessionResults.sessions,
					sessionSecureId,
				)
				changeSession(
					projectId!,
					navigate,
					nextSession,
					'Playing the previous session.',
				)
			}
		},
		[sessionSecureId, sessionResults.sessions],
	)

	useHotkeys(
		'cmd+up, ctrl+up',
		(e) => {
			analytics.track('PlayerIncreasePlayerSpeedKeyboardShortcut')
			moveFocusToDocument(e)

			if (playerSpeedIdx !== PLAYBACK_SPEED_OPTIONS.length - 1) {
				setPlayerSpeedIdx(playerSpeedIdx + 1)
			}
		},
		[playerSpeedIdx],
	)

	useHotkeys(
		'cmd+down, ctrl+down',
		(e) => {
			analytics.track('PlayerDecreasePlayerSpeedKeyboardShortcut')
			moveFocusToDocument(e)

			if (playerSpeedIdx !== 0) {
				setPlayerSpeedIdx(playerSpeedIdx - 1)
			}
		},
		[playerSpeedIdx],
	)

	useHotkeys(
		'f',
		(e) => {
			if (replayer) {
				analytics.track('PlayerToggleFullscreenKeyboardShortcut')
				moveFocusToDocument(e)

				setIsPlayerFullscreen((previousState) => !previousState)
			}
		},
		[replayer],
	)

	useHotkeys('c', (e) => {
		analytics.track('PlayerEnableCommentsKeyboardShortcut')
		moveFocusToDocument(e)

		setEnableInspectElement(false)
		setRightPanelView(RightPanelView.Comments)
		toast.success(
			'Commenting enabled, click anywhere on the video to create a comment.',
		)
	})

	useHotkeys('d', (e) => {
		analytics.track('PlayerEnableInspectElementKeyboardShortcut')
		moveFocusToDocument(e)

		setEnableInspectElement(true)
		setShowRightPanel(false)
		setRightPanelView(RightPanelView.Event)
		toast.success(
			"Inspect element enabled, you can open up your browser's DevTools and inspect the DOM now.",
		)
	})

	useHotkeys(
		'cmd+b, ctrl+b',
		(e) => {
			analytics.track('PlayerToggleLeftSidebarKeyboardShortcut')
			moveFocusToDocument(e)

			setShowLeftPanel(!showLeftPanel)
		},
		[showLeftPanel],
	)

	useHotkeys(
		'cmd+i, ctrl+i',
		(e) => {
			analytics.track('PlayerToggleRightSidebarKeyboardShortcut')
			moveFocusToDocument(e)

			setShowRightPanel(!showRightPanel)
		},
		[showRightPanel],
	)

	useHotkeys(
		'cmd+e, ctrl+e',
		(e) => {
			analytics.track('PlayerToggleTimelineKeyboardShortcut')
			moveFocusToDocument(e)

			setShowHistogram(!showHistogram)
		},
		[showHistogram],
	)

	useHotkeys(
		'cmd+/, ctrl+/',
		(e) => {
			analytics.track('PlayerToggleDevToolsKeyboardShortcut')
			moveFocusToDocument(e)

			setShowDevTools(!showDevTools)
		},
		[showDevTools],
	)
}

export const usePlayerFullscreen = () => {
	const playerCenterPanelRef = useRef<HTMLDivElement>(null)
	const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false)

	useEffect(() => {
		document.onfullscreenchange = () => {
			if (!document.fullscreenElement) {
				setIsPlayerFullscreen(false)
			}
		}
	}, [])

	useEffect(() => {
		if (playerCenterPanelRef.current) {
			if (isPlayerFullscreen) {
				const fullscreenBrowserFunctions =
					playerCenterPanelRef.current as HTMLDivElement & {
						mozRequestFullScreen(): Promise<void>
						webkitRequestFullscreen(): Promise<void>
						msRequestFullscreen(): Promise<void>
					}
				if (fullscreenBrowserFunctions.requestFullscreen) {
					fullscreenBrowserFunctions.requestFullscreen()
				} else if (fullscreenBrowserFunctions.mozRequestFullScreen) {
					/* Firefox */
					fullscreenBrowserFunctions.mozRequestFullScreen()
				} else if (fullscreenBrowserFunctions.webkitRequestFullscreen) {
					/* Chrome, Safari and Opera */
					fullscreenBrowserFunctions.webkitRequestFullscreen()
				} else if (fullscreenBrowserFunctions.msRequestFullscreen) {
					/* IE/Edge */
					fullscreenBrowserFunctions.msRequestFullscreen()
				}
			} else if (document.fullscreenElement) {
				const docWithBrowsersExitFunctions = document as Document & {
					mozCancelFullScreen(): Promise<void>
					webkitExitFullscreen(): Promise<void>
					msExitFullscreen(): Promise<void>
				}
				if (docWithBrowsersExitFunctions.exitFullscreen) {
					docWithBrowsersExitFunctions.exitFullscreen()
				} else if (docWithBrowsersExitFunctions.mozCancelFullScreen) {
					/* Firefox */
					docWithBrowsersExitFunctions.mozCancelFullScreen()
				} else if (docWithBrowsersExitFunctions.webkitExitFullscreen) {
					/* Chrome, Safari and Opera */
					docWithBrowsersExitFunctions.webkitExitFullscreen()
				} else if (docWithBrowsersExitFunctions.msExitFullscreen) {
					/* IE/Edge */
					docWithBrowsersExitFunctions.msExitFullscreen()
				}
			}
		}
	}, [isPlayerFullscreen])

	return {
		playerCenterPanelRef,
		isPlayerFullscreen,
		setIsPlayerFullscreen,
	}
}
