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

import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import SessionInsights from '@/pages/Player/RightPlayerPanel/components/SessionInsights/SessionInsights'

const RightPanelTabs = () => {
	const { selectedRightPanelTab, setSelectedRightPanelTab } =
		usePlayerUIContext()
	const { showAiExperiments } = usePlayerConfiguration()

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
				...(showAiExperiments
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
