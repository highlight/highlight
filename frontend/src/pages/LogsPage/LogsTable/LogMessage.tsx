import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui'
import React from 'react'

type Props = {
	message: string
	expanded: boolean
	query: string
}

const LogMessage = ({ message, expanded, query }: Props) => {
	const searchWords = query.split(' ')

	return (
		<Text
			weight="bold"
			family="monospace"
			lines={expanded ? undefined : '1'}
			break="word"
		>
			<TextHighlighter
				searchWords={searchWords}
				textToHighlight={message}
			/>
		</Text>
	)
}

export { LogMessage }
