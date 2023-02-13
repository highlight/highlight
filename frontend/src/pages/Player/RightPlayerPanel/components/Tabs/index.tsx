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
import MetadataPanel from '@pages/Player/MetadataPanel/MetadataPanel'
import SessionFullCommentList from '@pages/Player/SessionFullCommentList/SessionFullCommentList'
import { useParams } from '@util/react-router/useParams'
import { useRef } from 'react'

const RightPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const sessionCommentsRef = useRef(null)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { data: sessionCommentsData, loading: isLoadingComments } =
		useGetSessionCommentsQuery({
			variables: {
				session_secure_id: session_secure_id!,
			},
			skip: !session_secure_id,
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
							loading={isLoadingComments}
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
								size="small"
								variant={
									selectedRightPanelTab === 'Threads'
										? 'purple'
										: 'gray'
								}
								shape="rounded"
								label={`${
									sessionCommentsData?.session_comments
										?.length ?? 0
								}`}
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

export default RightPanelTabs
