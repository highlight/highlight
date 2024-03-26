import {
	RightPlayerPanelTabsId,
	RightPlayerPanelTabType,
} from '@pages/Player/RightPlayerPanel/constants'
import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import { useCallback, useEffect, useMemo } from 'react'

import { useActiveNetworkResourceId } from '@/hooks/useActiveNetworkResourceId'

import { EventsForTimeline } from './index'

export const PLAYBACK_SPEED_OPTIONS: readonly number[] = [1, 2, 4, 8]

/**
 * Gets configuration for the Player.
 */
const usePlayerConfiguration = () => {
	const [showLeftPanel, setShowLeftPanel] = useLocalStorage(
		'highlightMenuShowLeftPanel',
		true,
	)

	const [showRightPanel, setShowRightPanel] = useLocalStorage(
		'highlightMenuShowRightPanel',
		false,
	)

	const [showHistogram, setShowHistogram] = useLocalStorage(
		'highlightMenuShowHistogram',
		true,
	)

	const [showDevTools, setShowDevTools] = useLocalStorage(
		'highlightMenuOpenDevTools',
		false,
	)

	const [selectedDevToolsTab, setSelectedDevToolsTab] = useLocalStorage<Tab>(
		'tabs-DevTools-active-tab',
		Tab.Errors,
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

	const [playerSpeedIdx, _setPlayerSpeedIdx] = useLocalStorage(
		'highlightMenuSpeedIdx',
		2,
	)
	const setPlayerSpeedIdx = useCallback(
		(val: number) => {
			const modulo = PLAYBACK_SPEED_OPTIONS.length
			_setPlayerSpeedIdx((Math.round(val) + modulo) % modulo)
		},
		[_setPlayerSpeedIdx],
	)

	const [skipInactive, setSkipInactive] = useLocalStorage(
		'highlightMenuSkipInactive',
		true,
	)

	const [showPlayerMouseTail, setShowPlayerMouseTail] = useLocalStorage(
		'highlightShowPlayerMouseTail-v2',
		false,
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

	// Open the network tab if there is an active network resource on page load.
	const { activeNetworkResourceId } = useActiveNetworkResourceId()
	useEffect(() => {
		if (activeNetworkResourceId) {
			setSelectedDevToolsTab(Tab.Network)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

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
		setPlayerSpeedIdx,
		playerSpeedIdx,
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
		showHistogram,
		setShowHistogram,
	}
}

export default usePlayerConfiguration
