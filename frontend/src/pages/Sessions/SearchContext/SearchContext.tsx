import { BaseSearchContext } from '@context/BaseSearchContext'
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

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')
