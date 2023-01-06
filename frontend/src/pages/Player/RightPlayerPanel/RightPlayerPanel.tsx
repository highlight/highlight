import { useGetSessionCommentsQuery } from '@graph/hooks'
import {
	Badge,
	IconSolidChatAlt_2,
	IconSolidFire,
	IconSolidHashtag,
	Tabs,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import EventStreamV2 from '@pages/Player/components/EventStreamV2/EventStreamV2'
import {
	RightPlayerTab,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import React, { useEffect } from 'react'

import EventDetails from '../components/EventDetails/EventDetails'
import { MetadataBox } from '../MetadataBox/MetadataBox'
import MetadataPanel from '../MetadataPanel/MetadataPanel'
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '../ReplayerContext'
import SessionFullCommentList from '../SessionFullCommentList/SessionFullCommentList'
import * as styles from './style.css'

const RightPlayerPanel = React.memo(() => {
	const { showRightPanel: showRightPanelPreference, setShowRightPanel } =
		usePlayerConfiguration()
	const { showBanner } = useGlobalContext()
	const { canViewSession } = useReplayerContext()
	const { setSelectedRightPanelTab, activeEvent } = usePlayerUIContext()

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

	return (
		<>
			<div
				className={classNames(styles.playerRightPanelContainer, {
					[styles.playerRightPanelContainerHidden]: !showRightPanel,
				})}
			>
				{showRightPanel &&
					(activeEvent !== undefined ? (
						<EventDetails event={activeEvent} />
					) : (
						<div
							className={classNames(
								styles.playerRightPanelCollapsible,
								{
									[styles.playerRightPanelCollapsibleBannerShown]:
										showBanner,
								},
							)}
						>
							<MetadataBox />
							<RightPlayerPanelTabs />
						</div>
					))}
			</div>
		</>
	)
})

export default RightPlayerPanel

const RightPlayerPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const sessionCommentsRef = React.useRef(null)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: session_secure_id,
		},
	})

	return (
		<Tabs<RightPlayerTab>
			tab={selectedRightPanelTab}
			setTab={setSelectedRightPanelTab}
			pages={{
				['Events']: {
					page: <EventStreamV2 />,
					icon: (
						<IconSolidFire
							color={
								selectedRightPanelTab === 'Events'
									? colors.p9
									: undefined
							}
						/>
					),
				},
				['Threads']: {
					page: (
						<SessionFullCommentList
							parentRef={sessionCommentsRef}
							loading={loading}
							sessionCommentsData={sessionCommentsData}
						/>
					),
					icon: (
						<IconSolidChatAlt_2
							color={
								selectedRightPanelTab === 'Threads'
									? colors.p9
									: undefined
							}
						/>
					),
					badge: (
						<div
							style={{
								display: 'inline-flex',
								marginLeft: 4,
							}}
						>
							<Badge
								size="tiny"
								variant={
									selectedRightPanelTab === 'Threads'
										? 'purple'
										: 'grey'
								}
								shape="rounded"
								label={`${sessionCommentsData?.session_comments?.length}`}
							/>
						</div>
					),
				},
				['Metadata']: {
					page: <MetadataPanel />,
					icon: (
						<IconSolidHashtag
							color={
								selectedRightPanelTab === 'Metadata'
									? colors.p9
									: undefined
							}
						/>
					),
				},
			}}
		/>
	)
}
