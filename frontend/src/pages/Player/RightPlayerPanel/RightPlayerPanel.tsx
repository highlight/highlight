import { useGetSessionCommentsQuery } from '@graph/hooks'
import {
	Badge,
	IconSolidChatAlt_2,
	IconSolidFire,
	IconSolidHashtag,
	Tabs,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import EventStream from '@pages/Player/components/EventStream/EventStream'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames'
import React, { useEffect } from 'react'

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
	const { setSelectedRightPanelTab } = usePlayerUIContext()

	const showRightPanel = showRightPanelPreference && canViewSession

	useEffect(() => {
		const commentId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		)

		if (commentId) {
			setShowRightPanel(true)
			setSelectedRightPanelTab('Comments')
		}
	}, [setSelectedRightPanelTab, setShowRightPanel])

	return (
		<>
			<div
				className={classNames(styles.playerRightPanelContainer, {
					[styles.playerRightPanelContainerHidden]: !showRightPanel,
				})}
			>
				{showRightPanel && (
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
				)}
			</div>
		</>
	)
})

export default RightPlayerPanel

enum Tab {
	Events = 'Events',
	Threads = 'Threads',
	Metadata = 'Metadata',
}

const RightPlayerPanelTabs = React.memo(() => {
	const [tab, setTab] = React.useState<string>(Tab.Events)
	const sessionCommentsRef = React.useRef(null)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { data: sessionCommentsData, loading } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: session_secure_id,
		},
	})

	return (
		<Tabs<Tab>
			default={Tab.Events}
			onChange={setTab}
			pages={{
				[Tab.Events]: {
					page: <EventStream />,
					icon: (
						<IconSolidFire
							color={tab === Tab.Events ? colors.p9 : undefined}
						/>
					),
				},
				[Tab.Threads]: {
					page: (
						<SessionFullCommentList
							parentRef={sessionCommentsRef}
							loading={loading}
							sessionCommentsData={sessionCommentsData}
						/>
					),
					icon: (
						<IconSolidChatAlt_2
							color={tab === Tab.Threads ? colors.p9 : undefined}
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
									tab === Tab.Threads ? 'purple' : 'grey'
								}
								shape="rounded"
								label={`${sessionCommentsData?.session_comments?.length}`}
							/>
						</div>
					),
				},
				[Tab.Metadata]: {
					page: <MetadataPanel />,
					icon: (
						<IconSolidHashtag
							color={tab === Tab.Metadata ? colors.p9 : undefined}
						/>
					),
				},
			}}
		/>
	)
})
