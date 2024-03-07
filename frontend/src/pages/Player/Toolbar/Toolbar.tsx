import { useAuthContext } from '@authentication/AuthContext'
import TimelineIndicatorsBarGraph from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import { useEffect } from 'react'

import { EventsForTimeline, EventsForTimelineKeys } from '../PlayerHook/utils'
import usePlayerConfiguration, {
	PLAYBACK_SPEED_OPTIONS,
} from '../PlayerHook/utils/usePlayerConfiguration'
import { ReplayerState, useReplayerContext } from '../ReplayerContext'
import { usePlayerKeyboardShortcuts } from '../utils/PlayerHooks'

export const TimelineAnnotationColors: {
	[key in EventsForTimelineKeys[number]]: string
} = {
	Click: '--color-purple-600',
	Focus: '--color-blue-400',
	Reload: '--color-green-300',
	Navigate: '--color-yellow-400',
	Errors: '--color-red-400',
	Segment: '--color-green-500',
	Track: '--color-blue-300',
	Comments: '--color-green-500',
	Identify: '--color-orange-500',
	Viewport: '--color-purple-600',
	'Web Vitals': '--color-red-600',
	Referrer: '--color-yellow-800',
	TabHidden: '--color-gray-800',
	RageClicks: '--color-red-900',
}

export function getAnnotationColor(
	eventTypeKey: typeof EventsForTimeline[number],
) {
	return TimelineAnnotationColors[eventTypeKey]
}

interface Props {
	width: number
}

export const Toolbar = ({ width }: Props) => {
	const { replayer, time, state, play, pause, isPlayerReady, isLiveMode } =
		useReplayerContext()
	usePlayerKeyboardShortcuts()

	const {
		playerSpeedIdx,
		autoPlayVideo,
		enableInspectElement,
		selectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()
	const { isLoggedIn } = useAuthContext()

	useEffect(() => {
		if (replayer) {
			if (enableInspectElement) {
				replayer.enableInteract()
			} else {
				replayer.disableInteract()
			}
		}
	}, [enableInspectElement, replayer])

	useEffect(() => {
		if (!isLiveMode) {
			replayer?.setConfig({
				speed: PLAYBACK_SPEED_OPTIONS[playerSpeedIdx],
			})
		} else {
			replayer?.setConfig({ speed: 1 })
		}
	}, [replayer, isLiveMode, playerSpeedIdx])

	// Automatically start the player if the user has set the preference.
	useEffect(() => {
		if (isLoggedIn) {
			if ((autoPlayVideo || isLiveMode) && replayer && isPlayerReady) {
				if (state === ReplayerState.LoadedAndUntouched) {
					play(time)
				} else if (state === ReplayerState.LoadedWithDeepLink) {
					pause(time)
				}
			}
		}
	}, [
		autoPlayVideo,
		isLiveMode,
		isLoggedIn,
		isPlayerReady,
		pause,
		play,
		replayer,
		state,
		time,
	])

	return (
		<>
			<TimelineIndicatorsBarGraph
				selectedTimelineAnnotationTypes={
					selectedTimelineAnnotationTypes
				}
				width={width}
			/>
		</>
	)
}
