import { ApolloError } from '@apollo/client'
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
import {
	SearchEntry,
	useSearchHistory,
} from '@/components/Search/SearchForm/hooks'

export const SORT_COLUMN = 'sort_column'
export const SORT_DIRECTION = 'sort_direction'

export type AiSuggestion = {
	query: string
	dateRange: {
		startDate?: Date
		endDate?: Date
	}
}

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
	resultFormatted?: string
	moreResults: number
	resetMoreResults: () => void
	histogramBucketSize?: DateHistogramBucketSize
	pollingExpired: boolean
	aiMode: boolean
	setAiMode: (aiMode: boolean) => void
	aiQuery: string
	setAiQuery: (aiQuery: string) => void
	onAiSubmit: (aiQuery: string) => void
	aiSuggestion?: AiSuggestion
	aiSuggestionLoading?: boolean
	aiSuggestionError?: ApolloError
	defaultValues?: string[]
	recentSearches: SearchEntry[]
	handleSearch: (query: string, queryParts: SearchExpression[]) => void
	historyLoading: boolean
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
	resultFormatted?: SearchContext['resultFormatted']
	totalCount?: SearchContext['totalCount']
	histogramBucketSize?: SearchContext['histogramBucketSize']
	moreResults?: SearchContext['moreResults']
	resetMoreResults?: SearchContext['resetMoreResults']
	pollingExpired?: SearchContext['pollingExpired']
	aiMode?: SearchContext['aiMode']
	setAiMode?: SearchContext['setAiMode']
	onAiSubmit?: SearchContext['onAiSubmit']
	aiSuggestion?: SearchContext['aiSuggestion']
	aiSuggestionLoading?: SearchContext['aiSuggestionLoading']
	aiSuggestionError?: SearchContext['aiSuggestionError']
}

export const SearchContext: React.FC<Props> = ({
	children,
	disabled = false,
	loading = false,
	initialQuery,
	results = [],
	resultFormatted = '',
	totalCount = 0,
	moreResults = 0,
	page = START_PAGE,
	histogramBucketSize,
	onSubmit,
	resetMoreResults = () => null,
	setPage = () => null,
	pollingExpired = false,
	aiMode = false,
	setAiMode = () => null,
	onAiSubmit = () => null,
	aiSuggestion,
	aiSuggestionLoading,
	aiSuggestionError,
	...searchTimeContext
}) => {
	const [queryParam] = useQueryParam('query', StringParam)
	const [query, setQuery] = useState(queryParam ?? initialQuery)
	const [aiQuery, setAiQuery] = useState('')
	const { queryParts, tokens } = parseSearch(query)
	const tokenGroups = buildTokenGroups(tokens)
	const { handleSearch, recentSearches, historyLoading } = useSearchHistory()
	const handleSubmit = (query: string) => {
		onSubmit(query)
		if (query) {
			const queryParts = parseSearch(query)?.queryParts || []
			try {
				const newQueryParts = JSON.parse(
					JSON.stringify(queryParts || []),
				)
				handleSearch?.(query, newQueryParts)
			} catch (err) {
				//do nothing
				console.error(
					'Something went wrong while parsing the queryParts',
					err,
				)
			}
		}
	}

	return (
		<SearchContextProvider
			value={{
				results,
				resultFormatted,
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
				onSubmit: handleSubmit,
				setPage,
				resetMoreResults,
				pollingExpired,
				aiMode,
				aiQuery,
				setAiQuery,
				setAiMode,
				onAiSubmit,
				aiSuggestion,
				aiSuggestionLoading,
				aiSuggestionError,
				recentSearches,
				handleSearch,
				historyLoading,
				...searchTimeContext,
			}}
		>
			{children}
		</SearchContextProvider>
	)
}
