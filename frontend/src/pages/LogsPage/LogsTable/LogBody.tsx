import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui'
import React from 'react'

type Props = {
	body: string
	query: string
}

const LogBody = ({ body, query }: Props) => {
	const searchWords = query.split(' ')

	return (
		<Text weight="bold" family="monospace">
			<TextHighlighter searchWords={searchWords} textToHighlight={body} />
		</Text>
	)
}

export { LogBody }
