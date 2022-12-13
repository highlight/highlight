import { useAuthContext } from '@authentication/AuthContext'
import TimelineIndicatorsBarGraph from '@pages/Player/Toolbar/TimelineIndicators/TimelineIndicatorsBarGraph/TimelineIndicatorsBarGraph'
import ToolbarControlBar from '@pages/Player/Toolbar/ToolbarControlBar/ToolbarControlBar'
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems'
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import classNames from 'classnames'
import { useEffect } from 'react'

import { EventsForTimeline, EventsForTimelineKeys } from '../PlayerHook/utils'
import usePlayerConfiguration, {
	PLAYBACK_SPEED_OPTIONS,
} from '../PlayerHook/utils/usePlayerConfiguration'
import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour'
import { ReplayerState, useReplayerContext } from '../ReplayerContext'
import { usePlayerKeyboardShortcuts } from '../utils/PlayerHooks'
import { DevToolsContextProvider } from './DevToolsContext/DevToolsContext'
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow'
import styles from './Toolbar.module.scss'

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
	const {
		replayer,
		time,
		state,
		play,
		pause,
		isPlayerReady,
		isLiveMode,
		sessionMetadata,
	} = useReplayerContext()

	usePlayerKeyboardShortcuts()

	const {
		playerSpeedIdx,
		showDevTools,
		setShowDevTools,
		selectedDevToolsTab,
		setSelectedDevToolsTab,
		autoPlayVideo,
		enableInspectElement,
		selectedTimelineAnnotationTypes,
	} = usePlayerConfiguration()
	const toolbarItems = useToolbarItems()
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
		<ToolbarItemsContextProvider value={toolbarItems}>
			<DevToolsContextProvider
				value={{
					openDevTools: showDevTools,
					setOpenDevTools: setShowDevTools,
					devToolsTab: selectedDevToolsTab,
					setDevToolsTab: setSelectedDevToolsTab,
				}}
			>
				<TimelineIndicatorsBarGraph
					selectedTimelineAnnotationTypes={
						selectedTimelineAnnotationTypes
					}
					width={width}
				/>

				{!isLiveMode && (
					<div id={PlayerPageProductTourSelectors.DevToolsPanel}>
						<DevToolsWindow
							time={(sessionMetadata.startTime ?? 0) + time}
							startTime={sessionMetadata.startTime ?? 0}
							width={width}
						/>
					</div>
				)}
			</DevToolsContextProvider>
			<div
				className={classNames(styles.toolbarSection, {
					[styles.devToolsOpen]: showDevTools,
				})}
				style={{ width }}
			>
				<ToolbarControlBar />
			</div>
		</ToolbarItemsContextProvider>
	)
}
