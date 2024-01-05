import { Box } from '@highlight-run/ui/components'
import React from 'react'

import { Token } from '@/components/Search/SearchForm/QueryPart'
import { buildTokenGroups } from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'

import * as styles from './styles.css'

type Props = {
	query: string
}

export const SavedSegmentQueryDisplay: React.FC<Props> = ({ query }) => {
	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens, queryParts, query)

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

				return (
					<Box
						key={term}
						cssClass={styles.comboboxTag}
						py="6"
						position="relative"
						whiteSpace="nowrap"
					>
						{group.tokens.map((token, index) => {
							const { text } = token

							return (
								<Token key={`${text}-${index}`} text={text} />
							)
						})}

						<Box cssClass={styles.comboboxTagBackground} />
					</Box>
				)
			})}
		</Box>
	)
}
