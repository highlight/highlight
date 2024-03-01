import LoadingBox from '@/components/LoadingBox'
import { Panel } from '@/components/RelatedResources/Panel'

export const PanelLoading = () => {
	return (
		<Panel open={true}>
			<LoadingBox />
		</Panel>
	)
}
