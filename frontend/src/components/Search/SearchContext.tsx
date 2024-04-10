import { createContext } from '@util/context/context'
import { useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	buildTokenGroups,
	TokenGroup,
} from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'

type SearchContext = {
	disabled?: boolean
	initialQuery: string
	query: string
	queryParts: SearchExpression[]
	tokenGroups: TokenGroup[]
	setQuery: (query: string) => void
	onSubmit: (query: string) => void
}

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')

type Props = {
	children: React.ReactNode
	disabled?: SearchContext['disabled']
	initialQuery: SearchContext['initialQuery']
	onSubmit: SearchContext['onSubmit']
}

export const SearchContext: React.FC<Props> = ({
	children,
	disabled = false,
	initialQuery,
	onSubmit,
}) => {
	const [queryParam] = useQueryParam('query', StringParam)
	const [query, setQuery] = useState(queryParam ?? '')
	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens)

	return (
		<SearchContextProvider
			value={{
				disabled,
				initialQuery,
				query,
				queryParts,
				tokenGroups,
				setQuery,
				onSubmit,
			}}
		>
			{children}
		</SearchContextProvider>
	)
}
