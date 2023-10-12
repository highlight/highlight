import { Box } from '@highlight-run/ui'
import React from 'react'

import JsonViewer from '@/components/JsonViewer/JsonViewer'
import { Trace } from '@/graph/generated/schemas'

type Props = { span: Trace }

export const TraceSpanAttributes: React.FC<Props> = ({ span }) => {
	const attributes = { ...span }

	// Drop any attributes we don't want to display
	delete attributes.__typename

	return (
		<Box mt="10">
			<JsonViewer src={attributes} collapsed={false} />
		</Box>
	)
}
