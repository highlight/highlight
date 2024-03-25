import { Box, Callout, Text } from '@highlight-run/ui/components'

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

			<Box overflowY="scroll" px="36" pt="28" pb="20">
				{!traces?.length && loading ? (
					<LoadingBox />
				) : !traces?.length ? (
					<Box p="8">
						<Callout kind="error" title="Trace not found" />
					</Box>
				) : (
					<Box>
						<TraceHeader />
						<TraceFlameGraph />

						<Box mt="40">
							<Text size="large" weight="bold">
								Info
							</Text>
							<Box bb="dividerWeak" mt="12" mb="8" />

							<TraceSpanAttributes span={span!} />
						</Box>
					</Box>
				)}
			</Box>
		</>
	)
}
