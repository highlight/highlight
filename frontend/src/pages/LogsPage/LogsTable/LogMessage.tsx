import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui'
import { BODY_KEY, LogsSearchParam } from '@pages/LogsPage/SearchForm/utils'
import React from 'react'

import * as styles from './LogsTable.css'

type Props = {
	message: string
	expanded: boolean
	queryTerms: LogsSearchParam[]
}

const LogMessage = ({ message, expanded, queryTerms }: Props) => {
	const searchWords =
		queryTerms.find((qt) => qt.key === BODY_KEY)?.value.split(' ') || []

	return (
		<Text
			weight="bold"
			family="monospace"
			lines={expanded ? undefined : '1'}
			break="word"
		>
			<TextHighlighter
				highlightClassName={styles.textHighlight}
				searchWords={searchWords}
				textToHighlight={message}
			/>
		</Text>
	)
}

export { LogMessage }
