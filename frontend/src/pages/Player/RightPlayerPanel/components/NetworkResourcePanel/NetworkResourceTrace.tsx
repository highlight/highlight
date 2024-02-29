import {
	Box,
	Callout,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import { useEffect } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useProjectId } from '@/hooks/useProjectId'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import analytics from '@/util/analytics'

export const NetworkResourceTrace: React.FC = () => {
	const { projectId } = useProjectId()
	const { loading, selectedSpan, traceName } = useTrace()

	useEffect(() => {
		analytics.track('session_network-resource-trace_view')
	}, [])

	if (loading) {
		return <LoadingBox />
	}

	if (!traceName) {
		return (
			<Box
				p="8"
				display="flex"
				justifyContent="center"
				alignItems="center"
			>
				<Callout
					kind="error"
					title="Trace not found"
					style={{ paddingBottom: 16 }}
				>
					<Text>This could happen for the following reasons:</Text>
					<Text>
						1. Traces are not configured yet for your project.
						Follow{' '}
						<TextLink
							href={`/${projectId}/setup/traces`}
							target="_self"
						>
							setup instructions
						</TextLink>{' '}
						to enable them.
					</Text>
					<Text>
						2. The trace was sampled out. Your sampling settings
						could be configured{' '}
						<TextLink
							href={`/${projectId}/settings/filters`}
							target="_self"
						>
							using filters
						</TextLink>{' '}
						or in your code calling our SDK.
					</Text>
				</Callout>
			</Box>
		)
	}

	return (
		<Stack gap="12" direction="column" p="8">
			<TraceFlameGraph />
			{selectedSpan && <TraceSpanAttributes span={selectedSpan} />}
		</Stack>
	)
}
