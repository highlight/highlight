import {
	IconSolidFire,
	IconSolidHashtag,
	IconSolidSparkles,
	Tabs,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import EventStreamV2 from '@pages/Player/components/EventStreamV2/EventStreamV2'
import {
	RightPlayerTab,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import MetadataPanel from '@pages/Player/MetadataPanel/MetadataPanel'
import { useParams } from '@util/react-router/useParams'

import { useGetWorkspaceSettingsForProjectQuery } from '@/graph/generated/hooks'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import SessionInsights from '@/pages/Player/RightPlayerPanel/components/SessionInsights/SessionInsights'

const RightPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const showSessionInsights = useFeatureFlag(Feature.AiSessionInsights)

	const { project_id } = useParams<{ project_id: string }>()

	const { data } = useGetWorkspaceSettingsForProjectQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
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
				...(showSessionInsights &&
				data?.workspaceSettingsForProject?.ai_insights
					? {
							['AI Insights']: {
								page: <SessionInsights />,
								icon: (
									<IconSolidSparkles
										color={
											selectedRightPanelTab ===
											'AI Insights'
												? colors.p9
												: undefined
										}
									/>
								),
							},
					  }
					: {}),
			}}
		/>
	)
}

export default RightPanelTabs
