import { Box, Callout } from '@highlight-run/ui/components'

import LoadingBox from '@/components/LoadingBox'
import { Panel } from '@/components/RelatedResources/Panel'
import { ResourcePanelProps } from '@/components/RelatedResources/RelatedResourcePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceHeader } from '@/pages/Traces/TraceHeader'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'

export const TracePanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	const { projectId } = useNumericProjectId()
	const path = `/${projectId}/traces/${resource.id}`
	const { highlightedSpan, loading, selectedSpan, traces } = useTrace()
	const span = selectedSpan || highlightedSpan

	return (
		<>
			<Panel.Header path={path} />

			<Box overflowY="scroll">
				{!traces?.length && loading ? (
					<LoadingBox />
				) : !traces?.length ? (
					<Box p="8">
						<Callout kind="error" title="Trace not found" />
					</Box>
				) : (
					<Box px="20">
						<TraceHeader />

						<Box>
							<TraceFlameGraph />
						</Box>

						<Box py="20">
							<TraceSpanAttributes span={span!} />
						</Box>
					</Box>
				)}
			</Box>
		</>
	)
}
