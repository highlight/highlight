import { Box } from '@highlight-run/ui/components'
import React from 'react'

import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { Token } from '@/components/Search/SearchForm/QueryPart'
import { buildTokenGroups } from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'

import * as styles from './styles.css'

type Props = {
	query: string
}

export const SavedSegmentQueryDisplay: React.FC<Props> = ({ query }) => {
	const { tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens)

	return (
		<Box
			cssClass={styles.comboboxTagsContainer}
			style={{
				left: 6,
			}}
		>
			{tokenGroups.map((group, index) => {
				const term = group.tokens.map((token) => token.text).join('')
				if (term.trim().length === 0) {
					return <span key={index}>{term}</span>
				}

				if (group.tokens[0].type === SearchGrammarParser.EOF) {
					return null
				}

				return (
					<Box
						key={term}
						cssClass={styles.comboboxTag}
						py="6"
						position="relative"
						whiteSpace="nowrap"
					>
						{group.tokens.map((token, index) => {
							if (token.type === SearchGrammarParser.EOF) {
								return null
							}

							return (
								<Token
									key={`${token.text}-${index}`}
									token={token}
								/>
							)
						})}

						<Box cssClass={styles.comboboxTagBackground} />
					</Box>
				)
			})}
		</Box>
	)
}
