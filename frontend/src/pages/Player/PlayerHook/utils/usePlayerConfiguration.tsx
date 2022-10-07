import {
	RightPlayerPanelTabsId,
	RightPlayerPanelTabType,
} from '@pages/Player/RightPlayerPanel/RightPlayerPanel'
import useLocalStorage from '@rehooks/local-storage'
import { useMemo } from 'react'

import { DevToolTabType } from '../../Toolbar/DevToolsContext/DevToolsContext'
import { EventsForTimeline } from '.'

/**
 * Gets configuration for the Player.
 */
const usePlayerConfiguration = () => {
	const [showLeftPanel, setShowLeftPanel] = useLocalStorage(
		'highlightMenuShowLeftPanel',
		false,
	)
	const [showRightPanel, setShowRightPanel] = useLocalStorage(
		'highlightMenuShowRightPanel',
		true,
	)
	const [showDevTools, setShowDevTools] = useLocalStorage(
		'highlightMenuOpenDevTools',
		false,
	)
	const [selectedDevToolsTab, setSelectedDevToolsTab] =
		useLocalStorage<DevToolTabType>(
			'tabs-DevTools-active-tab',
			DevToolTabType.Errors,
		)
	const [selectedRightPlayerPanelTab, setSelectedRightPlayerPanelTab] =
		useLocalStorage<RightPlayerPanelTabType>(
			`tabs-${RightPlayerPanelTabsId}-active-tab`,
			RightPlayerPanelTabType.Events,
		)
	const [_autoPlayVideo, setAutoPlayVideo] = useLocalStorage(
		'highlightMenuAutoPlayVideo',
		false,
	)
	const autoPlayVideo = useMemo(() => _autoPlayVideo, [_autoPlayVideo])
	/** Whether to automatically play the next session when the current session is done. */
	const [autoPlaySessions, setAutoPlaySessions] = useLocalStorage(
		'highlightAutoPlaySessions',
		false,
	)
	const [
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
	] = useLocalStorage('highlightTimelineAnnotationTypes', [
		...EventsForTimeline,
	])
	const [
		selectedTimelineAnnotationTypesUserPersisted,
		setSelectedTimelineAnnotationTypesUserPersisted,
	] = useLocalStorage('highlightTimelineAnnotationTypesUserPersisted', [
		...EventsForTimeline,
	])
	const [playerTime, setPlayerTime] = useLocalStorage('playerTime', 0)
	const [enableInspectElement, setEnableInspectElement] = useLocalStorage(
		'highlightMenuEnableDOMInteractions',
		false,
	)
	const [playerSpeed, setPlayerSpeed] = useLocalStorage(
		'highlightMenuSpeed',
		2,
	)
	const [skipInactive, setSkipInactive] = useLocalStorage(
		'highlightMenuSkipInactive',
		true,
	)
	const [showPlayerMouseTail, setShowPlayerMouseTail] = useLocalStorage(
		'highlightShowPlayerMouseTail',
		true,
	)
	const [showPlayerAbsoluteTime, setShowPlayerAbsoluteTime] = useLocalStorage(
		'highlightShowPlayerAbsoluteTime',
		false,
	)
	const [_showDetailedSessionView, setShowDetailedSessionView] =
		useLocalStorage('highlightShowDetailedSessionView', true)
	const showDetailedSessionView = useMemo(
		() => _showDetailedSessionView,
		[_showDetailedSessionView],
	)

	return {
		showLeftPanel,
		setShowLeftPanel,
		showRightPanel,
		setShowRightPanel,
		showDevTools,
		setShowDevTools,
		selectedDevToolsTab,
		setSelectedDevToolsTab,
		autoPlayVideo,
		setAutoPlayVideo,
		autoPlaySessions,
		setAutoPlaySessions,
		selectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypes,
		selectedTimelineAnnotationTypesUserPersisted,
		setSelectedTimelineAnnotationTypesUserPersisted,
		playerTime,
		setPlayerTime,
		enableInspectElement,
		setEnableInspectElement,
		playerSpeed,
		setPlayerSpeed,
		skipInactive,
		setSkipInactive,
		showPlayerMouseTail,
		setShowPlayerMouseTail,
		showDetailedSessionView,
		setShowDetailedSessionView,
		showPlayerAbsoluteTime,
		setShowPlayerAbsoluteTime,
		selectedRightPlayerPanelTab,
		setSelectedRightPlayerPanelTab,
	}
}

export default usePlayerConfiguration
