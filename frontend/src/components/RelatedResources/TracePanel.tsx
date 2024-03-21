import { RelatedTrace } from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'

export const TracePanel: React.FC<{ resource: RelatedTrace }> = ({
	resource,
}) => {
	const { projectId } = useNumericProjectId()

	return (
		<Panel open={true}>
			<TraceProvider projectId={projectId!} traceId={resource.id}>
				<TracePage />
			</TraceProvider>
		</Panel>
	)
}
