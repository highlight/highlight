import LoadingBox from '@components/LoadingBox'
import { Box } from '@highlight-run/ui'
import EventDetails from '@pages/Player/components/EventDetails/EventDetails'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { MetadataBox } from '@pages/Player/MetadataBox/MetadataBox'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import RightPanelTabs from '@pages/Player/RightPlayerPanel/components/Tabs'
import React, { useEffect, useMemo } from 'react'

import * as style from './style.css'

const RightPlayerPanel = () => {
	const { showRightPanel: showRightPanelPreference, setShowRightPanel } =
		usePlayerConfiguration()
	const { canViewSession, session } = useReplayerContext()
	const { setSelectedRightPanelTab, activeEvent, rightPanelView } =
		usePlayerUIContext()

	const showRightPanel = showRightPanelPreference && canViewSession

	useEffect(() => {
		const commentId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		)

		if (commentId) {
			setShowRightPanel(true)
			setSelectedRightPanelTab('Threads')
		}
	}, [setSelectedRightPanelTab, setShowRightPanel])

	const content = useMemo(() => {
		if (!session) return <LoadingBox />

		switch (rightPanelView) {
			case RightPanelView.SESSION:
				return (
					<Box height="full" display="flex" flexDirection="column">
						<MetadataBox />
						<RightPanelTabs />
					</Box>
				)
			case RightPanelView.EVENT:
				return activeEvent ? <EventDetails event={activeEvent} /> : null
		}
	}, [activeEvent, rightPanelView, session])

	return (
		<Box
			flexShrink={0}
			bt="dividerWeak"
			bl="dividerWeak"
			shadow="small"
			style={{ width: style.RIGHT_PANEL_WIDTH }}
			cssClass={[
				{
					[style.playerRightPanelContainerHidden]: !showRightPanel,
				},
			]}
		>
			{content}
		</Box>
	)
}

export default RightPlayerPanel
