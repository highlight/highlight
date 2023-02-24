import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui'
import React from 'react'

type Props = {
	body: string
	expanded: boolean
	query: string
}

const LogBody = ({ body, expanded, query }: Props) => {
	const searchWords = query.split(' ')

	return (
		<Text
			weight="bold"
			family="monospace"
			lines={expanded ? undefined : '1'}
		>
			<TextHighlighter searchWords={searchWords} textToHighlight={body} />
		</Text>
	)
}

export { LogBody }
