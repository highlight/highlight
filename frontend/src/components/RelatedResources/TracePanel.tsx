import { Panel } from '@/components/RelatedResources/Panel'
import { ResourcePanelProps } from '@/components/RelatedResources/RelatedResourcePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'

export const TracePanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	const { projectId } = useNumericProjectId()

	return (
		<Panel open={true}>
			<TraceProvider projectId={projectId!} traceId={resource.id}>
				<TracePage />
			</TraceProvider>
		</Panel>
	)
}
