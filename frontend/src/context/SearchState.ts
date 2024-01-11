import { DEFAULT_TIME_PRESETS } from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useReducer } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'
import { JsonParam, NumberParam, useQueryParams } from 'use-query-params'

import { useAuthContext } from '@/authentication/AuthContext'
import { CustomField } from '@/components/QueryBuilder/QueryBuilder'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import { BaseSearchContext, Segment } from '@/context/BaseSearchContext'
import { Admin, DateHistogramBucketSize } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'
import { useParams } from '@/util/react-router/useParams'
import { QueryBuilderStateParam } from '@/util/url/params'

interface SearchState {
	searchQuery: string
	searchResultsLoading: boolean
	searchResultsCount: number | undefined
	existingQuery: string
	histogramBucketSize: DateHistogramBucketSize
	page: number
	selectedSegment: Segment
	startDate: Date
	endDate: Date
}

enum SearchActionType {
	setSearchQuery,
	setSelectedSegment,
	setPage,
	setSearchResultsLoading,
	setSearchResultsCount,
	updateSearchTime,
}

type SearchAction =
	| setSearchQuery
	| setSelectedSegment
	| setPage
	| setSearchResultsLoading
	| setSearchResultsCount

interface setSearchQuery {
	type: SearchActionType.setSearchQuery
	searchQuery: React.SetStateAction<SearchState['searchQuery']>
	admin: Admin | undefined
	customFields: CustomField[]
	startDate: Date
	endDate: Date
}

interface setSelectedSegment {
	type: SearchActionType.setSelectedSegment
	selectedSegment: React.SetStateAction<SearchState['selectedSegment']>
	query: string
	admin: Admin | undefined
	customFields: CustomField[]
	startDate: Date
	endDate: Date
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
			s.searchQuery = addDates(
				evaluateAction(action.searchQuery, s.searchQuery),
				action.startDate,
				action.endDate,
			)
			s.histogramBucketSize = determineHistogramBucketSize(
				action.startDate,
				action.endDate,
			)
			s.startDate = action.startDate
			s.endDate = action.endDate
			break
		case SearchActionType.setSelectedSegment:
			const query = addDates(
				action.query,
				action.startDate,
				action.endDate,
			)
			s.selectedSegment = evaluateAction(
				action.selectedSegment,
				s.selectedSegment,
			)
			s.searchQuery = query
			s.existingQuery = query
			s.histogramBucketSize = determineHistogramBucketSize(
				action.startDate,
				action.endDate,
			)
			s.startDate = action.startDate
			s.endDate = action.endDate
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
	return s
}

const SearchInitialState = {
	searchResultsLoading: true,
	searchResultsCount: undefined,
}

const addDates = (searchQuery: string, startDate: Date, endDate: Date) => {
	const { isAnd, rules }: { isAnd: boolean; rules: any } =
		JSON.parse(searchQuery)
	return JSON.stringify({
		isAnd,
		rules,
		dateRange: {
			start_date: startDate,
			end_date: endDate,
		},
	})
}

export const useGetInitialSearchState = (
	page: 'sessions' | 'errors',
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
	startDate: Date,
	endDate: Date,
): SearchState => {
	const [queryParams] = useQueryParams({
		query: QueryBuilderStateParam,
		page: NumberParam,
	})

	const { project_id } = useParams<{
		project_id: string
	}>()

	const segmentKey = `${segmentKeyPrefix}-${project_id}`
	const [selectedSegment] = useLocalStorage<
		{ name: string; id: string } | undefined
	>(segmentKey, undefined)

	// sessions / errors search state exists outside of the sessions / errors pages.
	// only set the state from the url params if we're currently on the page
	const location = useLocation()
	const pathSnippet = location.pathname.split('/')[2]
	const isCurrentPage = page === pathSnippet

	const startingQuery = addDates(
		(isCurrentPage && queryParams.query) || defaultSearchQuery,
		startDate,
		endDate,
	)

	return {
		...SearchInitialState,
		searchQuery: startingQuery,
		existingQuery: startingQuery,
		histogramBucketSize: determineHistogramBucketSize(startDate, endDate),
		selectedSegment,
		page: (isCurrentPage && queryParams.page) || START_PAGE,
		startDate,
		endDate,
	}
}

export const useGetBaseSearchContext = (
	page: 'sessions' | 'errors',
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
	customFields: CustomField[],
): BaseSearchContext => {
	const { admin } = useAuthContext()

	const { startDate, endDate, updateSearchTime, datePickerValue } =
		useSearchTime({
			initialPreset: DEFAULT_TIME_PRESETS[5],
			presets: DEFAULT_TIME_PRESETS,
		})

	const initialState = useGetInitialSearchState(
		page,
		defaultSearchQuery,
		segmentKeyPrefix,
		startDate,
		endDate,
	)

	const { project_id } = useParams<{
		project_id: string
	}>()

	const segmentKey = `${segmentKeyPrefix}-${project_id}`

	const [state, dispatch] = useReducer(SearchReducer, initialState)

	const location = useLocation()
	const [, setUrlParams] = useQueryParams({
		page: NumberParam,
		query: QueryBuilderStateParam,
		segment: JsonParam,
	})
	useEffect(() => {
		const pathSnippet = location.pathname.split('/')[2]
		if (pathSnippet === page) {
			setUrlParams(
				{
					page: state.page,
					query: state.searchQuery,
					segment: state.selectedSegment,
				},
				'replaceIn',
			)
		}
	}, [
		state.searchQuery,
		state.page,
		state.selectedSegment,
		setUrlParams,
		location.pathname,
		page,
	])

	const setSearchQuery = useCallback(
		(searchQuery: React.SetStateAction<string>) => {
			dispatch({
				type: SearchActionType.setSearchQuery,
				searchQuery,
				admin,
				customFields,
				startDate,
				endDate,
			})
		},
		[admin, customFields, startDate, endDate],
	)

	const setSelectedSegment = useCallback(
		(selectedSegment: React.SetStateAction<Segment>, query: string) => {
			dispatch({
				type: SearchActionType.setSelectedSegment,
				selectedSegment,
				query,
				admin,
				customFields,
				startDate,
				endDate,
			})
			localStorage.setItem(segmentKey, JSON.stringify(selectedSegment))
		},
		[admin, customFields, segmentKey, startDate, endDate],
	)

	const removeSelectedSegment = useCallback(() => {
		setSelectedSegment(undefined, defaultSearchQuery)
	}, [defaultSearchQuery, setSelectedSegment])

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

	useEffect(() => {
		dispatch({
			type: SearchActionType.setSearchQuery,
			searchQuery: state.searchQuery,
			admin,
			customFields,
			startDate,
			endDate,
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startDate, endDate])

	return {
		...state,
		datePickerValue,
		setSearchQuery,
		setSelectedSegment,
		removeSelectedSegment,
		setPage,
		setSearchResultsLoading,
		setSearchResultsCount,
		updateSearchTime,
	}
}

const determineHistogramBucketSize = (startDate: Date, endDate: Date) => {
	const duration = moment.duration(moment(endDate).diff(moment(startDate)))
	return GetHistogramBucketSize(duration)
}
