import { Box, Callout, Text } from '@highlight-run/ui/components'

import LoadingBox from '@/components/LoadingBox'
import { Panel } from '@/components/RelatedResources/Panel'
import { TraceHeader } from '@/pages/Traces/TraceHeader'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import { TraceVisualizer } from '@/pages/Traces/TraceVisualizer'

export const TracePanel: React.FC = () => {
	const { highlightedSpan, loading, selectedSpan, traces } = useTrace()
	const span = selectedSpan || highlightedSpan
	const path = `${window.location.pathname}${window.location.search}`

	return (
		<>
			<Panel.Header>
				<Panel.HeaderCopyLinkButton path={path} />
				<Panel.HeaderDivider />
			</Panel.Header>

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
						<TraceVisualizer />

						<Box mt="40">
							<Text size="large" weight="bold">
								Info
							</Text>
							<Box bb="dividerWeak" mt="12" mb="8" />

							{span && <TraceSpanAttributes span={span} />}
						</Box>
					</Box>
				)}
			</Box>
		</>
	)
}
