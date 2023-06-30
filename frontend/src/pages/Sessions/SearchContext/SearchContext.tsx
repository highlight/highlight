import { BaseSearchContext } from '@context/BaseSearchContext'
import { SearchParamsInput } from '@graph/schemas'
import { createContext } from '@util/context/context'

import { QueryBuilderState } from '@/components/QueryBuilder/QueryBuilder'

type SearchContext = BaseSearchContext

export const showLiveSessions = (searchQuery: string): boolean => {
	// If query is defined, check if it allows live sessions
	if (!!searchQuery) {
		const query = JSON.parse(searchQuery) as QueryBuilderState
		// If any 'custom_processed' has 'false', assume we're showing live sessions
		const processedRules = query.rules.filter(
			(r) => r[0] === 'custom_processed',
		)
		return (
			processedRules.length === 0 ||
			processedRules.flatMap((i) => i).includes('false')
		)
	}

	return false
}

export const updateSearchTimeRange = (
	searchParams: SearchParamsInput,
	serializedValue: string, // TODO
): SearchParamsInput => {
	if (!searchParams.query) {
		console.error('Please use the searchParams from searchContext')
		return searchParams
	}
	const query = JSON.parse(searchParams.query) as QueryBuilderState
	query.rules = query.rules.map((rule) => {
		if (rule[0] === 'custom_created_at') {
			rule[2] = serializedValue
		}
		return rule
	})
	return {
		...searchParams,
		query: JSON.stringify(query),
	}
}

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')
