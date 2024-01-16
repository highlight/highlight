import { Box } from '@highlight-run/ui/components'

import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'

export const NetworkResourceTrace: React.FC = () => {
	const { selectedSpan } = useTrace()

	return (
		<Box p="8">
			<TraceFlameGraph />
			{selectedSpan && <TraceSpanAttributes span={selectedSpan} />}
		</Box>
	)
}
