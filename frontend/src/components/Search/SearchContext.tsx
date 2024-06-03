import { createContext } from '@util/context/context'
import { useState } from 'react'
import { StringParam, useQueryParam } from 'use-query-params'

import { SearchExpression } from '@/components/Search/Parser/listener'
import {
	buildTokenGroups,
	TokenGroup,
} from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { DateHistogramBucketSize } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'

export const SORT_COLUMN = 'sort_column'
export const SORT_DIRECTION = 'sort_direction'

interface SearchContext extends Partial<ReturnType<typeof useSearchTime>> {
	disabled: boolean
	loading: boolean
	initialQuery: string
	query: string
	queryParts: SearchExpression[]
	tokenGroups: TokenGroup[]
	setQuery: (query: string) => void
	onSubmit: (query: string) => void
	page: number
	setPage: (page: number) => void
	results: any[]
	totalCount: number
	moreResults: number
	resetMoreResults: () => void
	histogramBucketSize?: DateHistogramBucketSize
	pollingExpired: boolean
}

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')

interface Props extends Partial<ReturnType<typeof useSearchTime>> {
	children: React.ReactNode
	disabled?: SearchContext['disabled']
	loading?: SearchContext['loading']
	initialQuery: SearchContext['initialQuery']
	onSubmit: SearchContext['onSubmit']
	page?: SearchContext['page']
	setPage?: SearchContext['setPage']
	results?: SearchContext['results']
	totalCount?: SearchContext['totalCount']
	histogramBucketSize?: SearchContext['histogramBucketSize']
	moreResults?: SearchContext['moreResults']
	resetMoreResults?: SearchContext['resetMoreResults']
	pollingExpired?: SearchContext['pollingExpired']
}

export const SearchContext: React.FC<Props> = ({
	children,
	disabled = false,
	loading = false,
	initialQuery,
	results = [],
	totalCount = 0,
	moreResults = 0,
	page = START_PAGE,
	histogramBucketSize,
	onSubmit,
	resetMoreResults = () => null,
	setPage = () => null,
	pollingExpired = false,
	...searchTimeContext
}) => {
	const [queryParam] = useQueryParam('query', StringParam)
	const [query, setQuery] = useState(queryParam ?? initialQuery)
	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens)

	return (
		<SearchContextProvider
			value={{
				results,
				totalCount,
				moreResults,
				histogramBucketSize,
				disabled,
				loading,
				initialQuery,
				query,
				queryParts,
				tokenGroups,
				page,
				setQuery,
				onSubmit,
				setPage,
				resetMoreResults,
				pollingExpired,
				...searchTimeContext,
			}}
		>
			{children}
		</SearchContextProvider>
	)
}
