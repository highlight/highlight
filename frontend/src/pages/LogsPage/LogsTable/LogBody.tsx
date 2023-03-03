import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { IconSolidCheck, Text } from '@highlight-run/ui'
import React from 'react'

type Props = {
	body: string
	expanded: boolean
	query: string
	selected: boolean
}

const LogBody = ({ body, expanded, query, selected }: Props) => {
	const searchWords = query.split(' ')

	return (
		<Text
			weight="bold"
			family="monospace"
			lines={expanded ? undefined : '1'}
			break="word"
		>
			<TextHighlighter searchWords={searchWords} textToHighlight={body} />
			{selected && <IconSolidCheck />}
		</Text>
	)
}

export { LogBody }
