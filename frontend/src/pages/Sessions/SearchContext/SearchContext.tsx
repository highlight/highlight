import { BaseSearchContext } from '@context/BaseSearchContext'
import { SearchParamsInput } from '@graph/schemas'
import { QueryBuilderState } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/QueryBuilder/QueryBuilder'
import { createContext } from '@util/context/context'
import React from 'react'

type SearchContext = BaseSearchContext<SearchParamsInput> & {
	showStarredSessions: boolean
	setShowStarredSessions: React.Dispatch<React.SetStateAction<boolean>>
	isQuickSearchOpen: boolean
	setIsQuickSearchOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const showLiveSessions = (searchParams: SearchParamsInput): boolean => {
	// If query is defined, check if it allows live sessions
	if (!!searchParams.query) {
		const query = JSON.parse(searchParams.query) as QueryBuilderState
		// If any 'custom_processed' has 'false', assume we're showing live sessions
		const processedRules = query.rules.filter(
			(r) => r[0] === 'custom_processed',
		)
		return (
			processedRules.length === 0 ||
			processedRules.flatMap((i) => i).includes('false')
		)
	}

	// Else, default to the show_live_sessions search param
	return searchParams?.show_live_sessions ?? false
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
