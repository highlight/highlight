import { colors } from '@highlight-run/ui/colors'
import {
	IconSolidFire,
	IconSolidHashtag,
	IconSolidSparkles,
	Tabs,
} from '@highlight-run/ui/components'
import EventStreamV2 from '@pages/Player/components/EventStreamV2/EventStreamV2'
import {
	RightPlayerTab,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'
import MetadataPanel from '@pages/Player/MetadataPanel/MetadataPanel'

import { useGetWorkspaceSettingsQuery } from '@/graph/generated/hooks'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'
import SessionInsights from '@/pages/Player/RightPlayerPanel/components/SessionInsights/SessionInsights'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

const RightPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const showSessionInsights = useFeatureFlag(Feature.AiSessionInsights)

	const { currentWorkspace } = useApplicationContext()

	const { data } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
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
				data?.workspaceSettings?.ai_application
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
