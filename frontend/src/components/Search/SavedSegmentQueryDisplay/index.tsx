import { Box } from '@highlight-run/ui/components'
import React from 'react'

import SearchGrammarParser from '@/components/Search/Parser/SearchGrammarParser'
import { parseSearch } from '@/components/Search/utils'

import * as styles from './styles.css'

type Props = {
	query: string
}

export const SavedSegmentQueryDisplay: React.FC<Props> = ({ query }) => {
	const { tokenGroups } = parseSearch(query)

	return (
		<Box
			cssClass={styles.comboboxTagsContainer}
			style={{
				left: 6,
			}}
		>
			{tokenGroups.map((group, index) => {
				const term = group.map((token) => token.text).join('')
				if (term.trim().length === 0) {
					return <span key={index}>{term}</span>
				}

				return (
					<Box
						key={term}
						cssClass={styles.comboboxTag}
						py="6"
						position="relative"
						whiteSpace="nowrap"
					>
						{group.map((token, index) => {
							const { text } = token
							const key = `${text}-${index}`
							const isSeparator = SEPARATORS.includes(text)

							return isSeparator ? (
								<Box
									key={key}
									style={{ color: '#E93D82', zIndex: 1 }}
								>
									{text}
								</Box>
							) : (
								<Box key={key} style={{ zIndex: 1 }}>
									{text}
								</Box>
							)
						})}

						<Box cssClass={styles.comboboxTagBackground} />
					</Box>
				)
			})}
		</Box>
	)
}

const SEPARATORS = SearchGrammarParser.literalNames.map((name) =>
	name?.replaceAll("'", ''),
)
