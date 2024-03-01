import { Box } from '@highlight-run/ui/components'

import { Panel } from '@/components/RelatedResourcePanel/Panel'
import { ResourcePanelProps } from '@/components/RelatedResourcePanel/RelatedResourcePanel'

export const SessionPanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	return (
		<Panel open={true}>
			This is the session panel!
			<Box p="8" border="dividerWeak" my="8" borderRadius="4">
				<pre>{JSON.stringify(resource)}</pre>
			</Box>
		</Panel>
	)
}
