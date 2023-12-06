import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui/components'

import { BODY_KEY, SearchParam } from '@/components/Search/SearchForm/utils'

import * as styles from './LogsTable.css'

type Props = {
	message: string
	expanded: boolean
	queryTerms: SearchParam[]
}

const LogMessage = ({ message, expanded, queryTerms }: Props) => {
	const searchWords =
		queryTerms.find((qt) => qt.key === BODY_KEY)?.value.split(' ') || []

	return (
		<Text
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
