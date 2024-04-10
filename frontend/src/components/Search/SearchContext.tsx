import { createContext } from '@util/context/context'
import { useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { SearchExpression } from '@/components/Search/Parser/listener'
import { parseSearch } from '@/components/Search/utils'

type SearchContext = {
	initialQuery: string
	query: string
	queryParts: SearchExpression[]
	setQuery: (query: string) => void
	onSubmit: (query: string) => void
}

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')

type Props = {
	children: React.ReactNode
	initialQuery: SearchContext['initialQuery']
	onSubmit: SearchContext['onSubmit']
}

export const SearchContext: React.FC<Props> = ({
	children,
	initialQuery,
	onSubmit,
}) => {
	const [queryParam] = useQueryParam('query', StringParam)
	const [query, setQuery] = useState(queryParam ?? '')
	const { queryParts } = parseSearch(query)

	return (
		<SearchContextProvider
			value={{ initialQuery, query, queryParts, setQuery, onSubmit }}
		>
			{children}
		</SearchContextProvider>
	)
}
