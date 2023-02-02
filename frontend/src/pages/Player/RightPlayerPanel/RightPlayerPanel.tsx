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
import NetworkResourceDetails from '@pages/Player/RightPlayerPanel/components/NetworkResourceDetails/NetworkResourceDetails'
import RightPanelTabs from '@pages/Player/RightPlayerPanel/components/Tabs'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useMemo } from 'react'

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
		activeNetworkResource,
	} = usePlayerUIContext()

	const showRightPanel = showRightPanelPreference && canViewSession
	const { session_secure_id: sessionSecureId } = useParams<{
		session_secure_id: string
	}>()

	useEffect(() => {
		const commentId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		)

		if (commentId) {
			setShowRightPanel(true)
			setSelectedRightPanelTab('Threads')
		}
	}, [setSelectedRightPanelTab, setShowRightPanel])

	useEffect(() => {
		if (sessionSecureId) {
			setRightPanelView(RightPanelView.Session)
		}
	}, [sessionSecureId, setRightPanelView])

	const content = useMemo(() => {
		if (!session) return <LoadingBox />

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
			case RightPanelView.NetworkResource:
				if (activeNetworkResource) {
					return (
						<NetworkResourceDetails
							resource={activeNetworkResource}
						/>
					)
				} else {
					setRightPanelView(RightPanelView.Session)
					return null
				}
		}
	}, [
		activeError,
		activeEvent,
		activeNetworkResource,
		rightPanelView,
		session,
		setRightPanelView,
	])

	return (
		<Box
			flexShrink={0}
			bt="dividerWeak"
			bl="dividerWeak"
			shadow="small"
			cssClass={[
				style.playerRightPanelContainer,
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
