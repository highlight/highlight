import JsonViewer from '@components/JsonViewer/JsonViewer'
import { Box } from '@highlight-run/ui'
import ErrorSourcePreview from '@pages/ErrorsV2/ErrorSourcePreview/ErrorSourcePreview'
import { parseOptionalJSON } from '@util/string'
import React from 'react'

type Props = React.PropsWithChildren & {
	jsonOrText: string
}

export const JsonOrTextCard: React.FC<Props> = ({ jsonOrText }) => {
	const content = parseOptionalJSON(jsonOrText || '')

	return (
		<Box border="neutral" p="12" borderRadius="5">
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
