import JsonViewer from '@components/JsonViewer/JsonViewer'
import { Box } from '@highlight-run/ui/components'
import ErrorSourcePreview from '@pages/ErrorsV2/ErrorSourcePreview/ErrorSourcePreview'
import { parseOptionalJSON } from '@util/string'
import React from 'react'

type Props = React.PropsWithChildren & {
	stackTrace: string
}

export const UnstructuredStackTrace: React.FC<Props> = ({
	stackTrace = '',
}) => {
	const content = parseOptionalJSON(stackTrace)

	return (
		<Box border="secondary" p="12" borderRadius="5">
			{typeof content === 'object' ? (
				<JsonViewer src={content} collapsed={2} />
			) : (
				<ErrorSourcePreview
					lineContent={content}
					showLineNumbers={false}
				/>
			)}
		</Box>
	)
}
