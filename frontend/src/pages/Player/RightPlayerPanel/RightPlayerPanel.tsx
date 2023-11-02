import LoadingBox from '@components/LoadingBox'
import { Box } from '@highlight-run/ui'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { MetadataBox } from '@pages/Player/MetadataBox/MetadataBox'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import ErrorDetails from '@pages/Player/RightPlayerPanel/components/ErrorDetails/ErrorDetails'
import EventDetails from '@pages/Player/RightPlayerPanel/components/EventDetails/EventDetails'
import RightPanelTabs from '@pages/Player/RightPlayerPanel/components/Tabs'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'

import SessionFullCommentList from '@/pages/Player/SessionFullCommentList/SessionFullCommentList'

import * as style from './style.css'

const RightPlayerPanel = () => {
	const { showRightPanel: showRightPanelPreference, setShowRightPanel } =
		usePlayerConfiguration()
	const { canViewSession, session } = useReplayerContext()
	const {
		setSelectedRightPanelTab,
		activeEvent,
		rightPanelView,
		setRightPanelView,
		activeError,
	} = usePlayerUIContext()

	const showRightPanel = showRightPanelPreference && canViewSession

	useEffect(() => {
		const commentId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		)

		if (commentId) {
			setShowRightPanel(true)
			setRightPanelView(RightPanelView.Comments)
		} else {
			setSelectedRightPanelTab('Events')
		}
	}, [setRightPanelView, setSelectedRightPanelTab, setShowRightPanel])

	const content = useMemo(() => {
		if (!session) {
			return <LoadingBox />
		}

		switch (rightPanelView) {
			case RightPanelView.Session:
				return (
					<Box height="full" display="flex" flexDirection="column">
						<MetadataBox />
						<RightPanelTabs />
					</Box>
				)

			case RightPanelView.Event:
				if (activeEvent) {
					return <EventDetails event={activeEvent} />
				} else {
					setRightPanelView(RightPanelView.Session)
					return null
				}

			case RightPanelView.Error:
				if (activeError) {
					return <ErrorDetails error={activeError} />
				} else {
					setRightPanelView(RightPanelView.Session)
					return null
				}

			case RightPanelView.Comments:
				return <SessionFullCommentList />
		}
	}, [activeError, activeEvent, rightPanelView, session, setRightPanelView])

	return (
		<Box
			backgroundColor="white"
			flexShrink={0}
			bt="dividerWeak"
			bl="dividerWeak"
			cssClass={clsx(style.playerRightColumn, {
				[style.playerRightPanelContainerHidden]: !showRightPanel,
			})}
			overflowY="scroll"
			hiddenScroll
		>
			{content}
		</Box>
	)
}

export default RightPlayerPanel
