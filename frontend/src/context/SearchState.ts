import { useCallback, useEffect, useReducer } from 'react'
import { useLocalStorage } from 'react-use'
import { JsonParam, NumberParam, useQueryParams } from 'use-query-params'

import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import {
	BackendSearchQuery,
	BaseSearchContext,
	Segment,
} from '@/context/BaseSearchContext'
import { useParams } from '@/util/react-router/useParams'
import { QueryBuilderStateParam } from '@/util/url/params'

interface SearchState {
	searchQuery: string
	searchResultsLoading: boolean
	searchResultsCount: number | undefined
	existingQuery: string
	backendSearchQuery: BackendSearchQuery
	page: number
	selectedSegment: Segment
}

enum SearchActionType {
	setSearchQuery,
	setExistingQuery,
	setSelectedSegment,
	setBackendSearchQuery,
	setPage,
	setSearchResultsLoading,
	setSearchResultsCount,
}

type SearchAction =
	| setSearchQuery
	| setExistingQuery
	| setSelectedSegment
	| setBackendSearchQuery
	| setPage
	| setSearchResultsLoading
	| setSearchResultsCount

interface setSearchQuery {
	type: SearchActionType.setSearchQuery
	searchQuery: React.SetStateAction<SearchState['searchQuery']>
}

interface setExistingQuery {
	type: SearchActionType.setExistingQuery
	existingQuery: React.SetStateAction<SearchState['existingQuery']>
}

interface setSelectedSegment {
	type: SearchActionType.setSelectedSegment
	selectedSegment: React.SetStateAction<SearchState['selectedSegment']>
	query: string
}

interface setBackendSearchQuery {
	type: SearchActionType.setBackendSearchQuery
	backendSearchQuery: React.SetStateAction<SearchState['backendSearchQuery']>
}

type setPage = {
	type: SearchActionType.setPage
	page: React.SetStateAction<SearchState['page']>
}

type setSearchResultsLoading = {
	type: SearchActionType.setSearchResultsLoading
	searchResultsLoading: React.SetStateAction<
		SearchState['searchResultsLoading']
	>
}

type setSearchResultsCount = {
	type: SearchActionType.setSearchResultsCount
	searchResultsCount: React.SetStateAction<SearchState['searchResultsCount']>
}

const isFunction = (x: unknown): x is Function => typeof x === 'function'

const evaluateAction = <T>(
	action: React.SetStateAction<T>,
	currentValue: T,
): T => {
	if (isFunction(action)) {
		return action(currentValue)
	} else {
		return action
	}
}

export const SearchReducer = (
	state: SearchState,
	action: SearchAction,
): SearchState => {
	const s = { ...state }
	switch (action.type) {
		case SearchActionType.setSearchQuery:
			s.searchQuery = evaluateAction(action.searchQuery, s.searchQuery)
			break
		case SearchActionType.setExistingQuery:
			s.existingQuery = evaluateAction(
				action.existingQuery,
				s.existingQuery,
			)
			break
		case SearchActionType.setSelectedSegment:
			s.selectedSegment = evaluateAction(
				action.selectedSegment,
				s.selectedSegment,
			)
			s.searchQuery = action.query
			s.existingQuery = action.query
			break
		case SearchActionType.setBackendSearchQuery:
			s.backendSearchQuery = evaluateAction(
				action.backendSearchQuery,
				s.backendSearchQuery,
			)
			break
		case SearchActionType.setPage:
			s.page = evaluateAction(action.page, s.page)
			break
		case SearchActionType.setSearchResultsLoading:
			s.searchResultsLoading = evaluateAction(
				action.searchResultsLoading,
				s.searchResultsLoading,
			)
			break
		case SearchActionType.setSearchResultsCount:
			s.searchResultsCount = evaluateAction(
				action.searchResultsCount,
				s.searchResultsCount,
			)
			break
	}
	console.log('SearchReducer', action)
	return s
}

const SearchInitialState = {
	searchResultsLoading: true,
	searchResultsCount: undefined,
	backendSearchQuery: undefined,
}

export const useGetInitialSearchState = (
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
): SearchState => {
	const [queryParams] = useQueryParams({
		query: QueryBuilderStateParam,
		page: NumberParam,
		segment: JsonParam,
	})

	const { project_id } = useParams<{
		project_id: string
	}>()

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const segmentKey = `${segmentKeyPrefix}-${project_id}`

	const [selectedSegment] = useLocalStorage<
		{ name: string; id: string } | undefined
	>(segmentKey, undefined)

	return {
		...SearchInitialState,
		searchQuery: queryParams.query || defaultSearchQuery,
		existingQuery: queryParams.query || defaultSearchQuery, // ZANETODO: should this be set to the segment's? else we don't know if it's changing
		selectedSegment,
		page: queryParams.page || START_PAGE,
	}
}

export const useGetBaseSearchContext = (
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
): BaseSearchContext => {
	const initialState = useGetInitialSearchState(
		defaultSearchQuery,
		segmentKeyPrefix,
	)

	const [, setUrlParams] = useQueryParams({
		page: NumberParam,
		query: QueryBuilderStateParam,
		segment: JsonParam,
	})

	const { project_id } = useParams<{
		project_id: string
	}>()

	const segmentKey = `${segmentKeyPrefix}-${project_id}`

	const [state, dispatch] = useReducer(SearchReducer, initialState)

	useEffect(() => {
		setUrlParams(
			{
				page: state.page,
				query: state.searchQuery,
				segment: state.selectedSegment,
			},
			'replaceIn',
		)
	}, [state.searchQuery, state.page, state.selectedSegment, setUrlParams])

	const setSearchQuery = useCallback(
		(searchQuery: React.SetStateAction<string>) => {
			dispatch({
				type: SearchActionType.setSearchQuery,
				searchQuery,
			})
		},
		[],
	)

	const setExistingQuery = useCallback(
		(existingQuery: React.SetStateAction<string>) => {
			dispatch({
				type: SearchActionType.setExistingQuery,
				existingQuery,
			})
		},
		[],
	)

	const setSelectedSegment = useCallback(
		(selectedSegment: React.SetStateAction<Segment>, query: string) => {
			dispatch({
				type: SearchActionType.setSelectedSegment,
				selectedSegment,
				query,
			})
			localStorage.setItem(segmentKey, JSON.stringify(selectedSegment))
		},
		[segmentKey],
	)

	const removeSelectedSegment = useCallback(() => {
		setSelectedSegment(undefined, defaultSearchQuery)
	}, [defaultSearchQuery, setSelectedSegment])

	const setBackendSearchQuery = useCallback(
		(backendSearchQuery: React.SetStateAction<BackendSearchQuery>) => {
			dispatch({
				type: SearchActionType.setBackendSearchQuery,
				backendSearchQuery,
			})
			localStorage.setItem(segmentKey, JSON.stringify(undefined))
		},
		[segmentKey],
	)
	const setPage = useCallback((page: React.SetStateAction<number>) => {
		dispatch({
			type: SearchActionType.setPage,
			page: page,
		})
	}, [])

	const setSearchResultsLoading = useCallback(
		(searchResultsLoading: React.SetStateAction<boolean>) => {
			dispatch({
				type: SearchActionType.setSearchResultsLoading,
				searchResultsLoading,
			})
		},
		[],
	)

	const setSearchResultsCount = useCallback(
		(searchResultsCount: React.SetStateAction<number | undefined>) => {
			dispatch({
				type: SearchActionType.setSearchResultsCount,
				searchResultsCount,
			})
		},
		[],
	)

	return {
		...state,
		setSearchQuery,
		setExistingQuery,
		setSelectedSegment,
		removeSelectedSegment,
		setBackendSearchQuery,
		setPage,
		setSearchResultsLoading,
		setSearchResultsCount,
	}
}
