import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Text } from '@highlight-run/ui/components'

import { SearchExpression } from '@/components/Search/Parser/listener'
import { BODY_KEY } from '@/components/Search/SearchForm/utils'

import * as styles from './LogsTable.css'

type Props = {
	message: string
	expanded: boolean
	queryParts: SearchExpression[]
}

const LogMessage = ({ message, expanded, queryParts }: Props) => {
	const searchWords =
		queryParts.find((qt) => qt.key === BODY_KEY)?.value.split(' ') || []

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
