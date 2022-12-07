import EventStream from '@pages/Player/components/EventStream/EventStream'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { RightPlayerPanelTabType } from '@pages/Player/RightPlayerPanel/constants'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import classNames from 'classnames'
import React, { useEffect } from 'react'

import Tabs from '../../../components/Tabs/Tabs'
import { MetadataBox } from '../MetadataBox/MetadataBox'
import MetadataPanel from '../MetadataPanel/MetadataPanel'
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration'
import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour'
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

const RightPlayerPanelTabs = React.memo(() => {
	const sessionCommentsRef = React.useRef(null)
	return (
		<Tabs
			centered
			tabsHtmlId={`${PlayerPageProductTourSelectors.PlayerRightPanel}`}
			id="PlayerRightPanel"
			noPadding
			className={styles.tabs}
			tabs={[
				{
					key: RightPlayerPanelTabType.Events,
					panelContent: <EventStream />,
				},
				{
					key: RightPlayerPanelTabType.Comments,
					panelContent: (
						<div
							className={styles.tabContentContainer}
							ref={sessionCommentsRef}
						>
							<SessionFullCommentList
								parentRef={sessionCommentsRef}
							/>
						</div>
					),
				},
				{
					key: RightPlayerPanelTabType.Metadata,
					panelContent: (
						<div className={styles.tabContentContainer}>
							<MetadataPanel />
						</div>
					),
				},
			]}
		/>
	)
})
