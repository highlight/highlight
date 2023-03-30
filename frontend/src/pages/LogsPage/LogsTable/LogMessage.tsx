import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { ReservedLogKey } from '@graph/schemas'
import { Text } from '@highlight-run/ui'
import { BODY_KEY, LogsSearchParam } from '@pages/LogsPage/SearchForm/utils'
import React from 'react'

type Props = {
	message: string
	expanded: boolean
	queryTerms: LogsSearchParam[]
}

const LogMessage = ({ message, expanded, queryTerms }: Props) => {
	const searchWords =
		queryTerms
			.find(
				(qt) =>
					qt.key === BODY_KEY || qt.key === ReservedLogKey.Message,
			)
			?.value.replaceAll('"', '')
			.split(' ') || []

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
