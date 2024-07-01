import { colors } from '@highlight-run/ui/colors'
import {
	IconSolidFire,
	IconSolidHashtag,
	IconSolidSparkles,
	Tabs,
} from '@highlight-run/ui/components'
import {
	RightPlayerTab,
	usePlayerUIContext,
} from '@pages/Player/context/PlayerUIContext'

import { useGetWorkspaceSettingsQuery } from '@/graph/generated/hooks'
import EventStreamV2 from '@/pages/Player/components/EventStreamV2/EventStreamV2'
import MetadataPanel from '@/pages/Player/MetadataPanel/MetadataPanel'
import SessionInsights from '@/pages/Player/RightPlayerPanel/components/SessionInsights/SessionInsights'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

const RightPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()

	const { currentWorkspace } = useApplicationContext()

	const { data } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	const showAiInsights = data?.workspaceSettings?.ai_application

	return (
		<Tabs<RightPlayerTab>
			selectedId={selectedRightPanelTab}
			onChange={setSelectedRightPanelTab}
		>
			<Tabs.List px="8" gap="8">
				<Tabs.Tab
					id={RightPlayerTab.Events}
					icon={
						<IconSolidFire
							color={
								selectedRightPanelTab === RightPlayerTab.Events
									? colors.p9
									: undefined
							}
						/>
					}
				>
					Events
				</Tabs.Tab>
				<Tabs.Tab
					id={RightPlayerTab.Metadata}
					icon={
						<IconSolidHashtag
							color={
								selectedRightPanelTab ===
								RightPlayerTab.Metadata
									? colors.p9
									: undefined
							}
						/>
					}
				>
					Metadata
				</Tabs.Tab>
				{showAiInsights && (
					<Tabs.Tab
						id={RightPlayerTab.AIInsights}
						icon={
							<IconSolidSparkles
								color={
									selectedRightPanelTab ===
									RightPlayerTab.AIInsights
										? colors.p9
										: undefined
								}
							/>
						}
					>
						AI Insights
					</Tabs.Tab>
				)}
			</Tabs.List>
			<Tabs.Panel id={RightPlayerTab.Events}>
				<EventStreamV2 />
			</Tabs.Panel>
			<Tabs.Panel id={RightPlayerTab.Metadata}>
				<MetadataPanel />
			</Tabs.Panel>
			{showAiInsights && (
				<Tabs.Panel id={RightPlayerTab.AIInsights}>
					<SessionInsights />
				</Tabs.Panel>
			)}
		</Tabs>
	)
}

export default RightPanelTabs
