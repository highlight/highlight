import { defaultPresets, getNow } from '@highlight-run/ui/components'
import moment from 'moment'
import { useCallback, useEffect, useReducer } from 'react'
import { useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'
import { JsonParam, NumberParam, useQueryParams } from 'use-query-params'

import { useAuthContext } from '@/authentication/AuthContext'
import {
	CUSTOM_TYPE,
	CustomField,
	deserializeRules,
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	getAbsoluteEndTime,
	getAbsoluteStartTime,
	getType,
	hasArguments,
	MultiselectOption,
	Operator,
	RANGE_MAX_LENGTH,
	RuleProps,
	SelectOption,
	serializeRules,
	SESSION_TYPE,
	TIME_MAX_LENGTH,
} from '@/components/QueryBuilder/QueryBuilder'
import { searchObjectFromString } from '@/components/QueryBuilder/utils'
import { START_PAGE } from '@/components/SearchPagination/SearchPagination'
import { GetHistogramBucketSize } from '@/components/SearchResultsHistogram/SearchResultsHistogram'
import { SearchOption } from '@/components/Select/SearchSelect/SearchSelect'
import {
	BackendSearchQuery,
	BaseSearchContext,
	Segment,
} from '@/context/BaseSearchContext'
import { Admin } from '@/graph/generated/schemas'
import { useParams } from '@/util/react-router/useParams'
import { roundFeedDate } from '@/util/time'
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
	setSelectedSegment,
	setPage,
	setSearchResultsLoading,
	setSearchResultsCount,
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
	timeRangeField: SelectOption
}

interface setSelectedSegment {
	type: SearchActionType.setSelectedSegment
	selectedSegment: React.SetStateAction<SearchState['selectedSegment']>
	query: string
	admin: Admin | undefined
	customFields: CustomField[]
	timeRangeField: SelectOption
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
			s.searchQuery = tryAddDefaultDate(
				evaluateAction(action.searchQuery, s.searchQuery),
				action.timeRangeField,
			)
			s.backendSearchQuery = getSerializedQuery(
				s.searchQuery,
				action.admin,
				action.customFields,
				action.timeRangeField,
			)
			break
		case SearchActionType.setSelectedSegment:
			const query = tryPreserveDateFromExistingOrAddDefault(
				s.searchQuery,
				action.query,
				action.timeRangeField,
			)
			s.selectedSegment = evaluateAction(
				action.selectedSegment,
				s.selectedSegment,
			)
			s.searchQuery = query
			s.existingQuery = query
			s.backendSearchQuery = getSerializedQuery(
				s.searchQuery,
				action.admin,
				action.customFields,
				action.timeRangeField,
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
	return s
}

const SearchInitialState = {
	searchResultsLoading: true,
	searchResultsCount: undefined,
}

const tryAddDefaultDate = (
	searchQuery: string,
	timeRangeField: SelectOption,
): string => {
	const { isAnd, rules: serializedRules }: { isAnd: boolean; rules: any } =
		JSON.parse(searchQuery)
	const newRules = deserializeRules(serializedRules)
	const hasTimeRange =
		newRules.find((rule) => rule.field?.value === timeRangeField.value) !==
		undefined
	if (!hasTimeRange) {
		newRules.push(getDefaultTimeRangeRule(timeRangeField))
	}
	return JSON.stringify({
		isAnd,
		rules: serializeRules(newRules),
	})
}

// If the user is searching withing a time range, we want to preserve that time
// range when applying a segment.
const tryPreserveDateFromExistingOrAddDefault = (
	searchQuery: string,
	newSearchQuery: string,
	timeRangeField: SelectOption,
) => {
	const { isAnd, rules } = searchObjectFromString(searchQuery)
	const existingTimeRangeRule = rules.find(
		(rule: any) => rule.field?.value === timeRangeField.value,
	)

	let { rules: newRules } = searchObjectFromString(newSearchQuery)
	newRules = newRules.filter(
		(rule: any) => rule.field?.value !== timeRangeField.value,
	)

	if (existingTimeRangeRule) {
		newRules.push(existingTimeRangeRule)
	} else {
		newRules.push(getDefaultTimeRangeRule(timeRangeField))
	}

	return JSON.stringify({
		isAnd,
		rules: serializeRules(newRules),
	})
}

export const removeTimeField = (
	searchQuery: string,
	timeRangeField: SearchOption,
): string => {
	const { isAnd, rules } = searchObjectFromString(searchQuery)
	const filteredRules = rules.filter(
		(rule: RuleProps) => rule.field?.value !== timeRangeField.value,
	)

	return JSON.stringify({
		isAnd,
		rules: serializeRules(filteredRules),
	})
}

export const useGetInitialSearchState = (
	page: 'sessions' | 'errors',
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
	admin: Admin | undefined,
	customFields: CustomField[],
	timeRangeField: SelectOption,
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

	const startingQuery = tryAddDefaultDate(
		(isCurrentPage && queryParams.query) || defaultSearchQuery,
		timeRangeField,
	)

	return {
		...SearchInitialState,
		searchQuery: startingQuery,
		existingQuery: startingQuery,
		backendSearchQuery: getSerializedQuery(
			startingQuery,
			admin,
			customFields,
			timeRangeField,
		),
		selectedSegment,
		page: (isCurrentPage && queryParams.page) || START_PAGE,
	}
}

export const useGetBaseSearchContext = (
	page: 'sessions' | 'errors',
	defaultSearchQuery: string,
	segmentKeyPrefix: string,
	customFields: CustomField[],
	timeRangeField: SelectOption,
): BaseSearchContext => {
	const { admin } = useAuthContext()

	const initialState = useGetInitialSearchState(
		page,
		defaultSearchQuery,
		segmentKeyPrefix,
		admin,
		customFields,
		timeRangeField,
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
				timeRangeField,
			})
		},
		[admin, customFields, timeRangeField],
	)

	const setSelectedSegment = useCallback(
		(selectedSegment: React.SetStateAction<Segment>, query: string) => {
			dispatch({
				type: SearchActionType.setSelectedSegment,
				selectedSegment,
				query,
				admin,
				customFields,
				timeRangeField,
			})
			localStorage.setItem(segmentKey, JSON.stringify(selectedSegment))
		},
		[admin, customFields, segmentKey, timeRangeField],
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

	return {
		...state,
		setSearchQuery,
		setSelectedSegment,
		removeSelectedSegment,
		setPage,
		setSearchResultsLoading,
		setSearchResultsCount,
	}
}

type OpenSearchQuery = {
	query: any
	childQuery?: any
}

const getDefaultTimeRangeRule = (timeRangeField: SelectOption): RuleProps => {
	const defaultPreset = defaultPresets[5]
	const period = {
		label: defaultPreset.label, // Start at 30 days
		value: `${defaultPreset.startDate.toISOString()}_${getNow().toISOString()}`, // Start at 30 days
	}
	return {
		field: timeRangeField,
		op: 'between_date',
		val: {
			kind: 'multi',
			options: [period],
		},
	}
}

const getSerializedQuery = (
	searchQuery: string,
	admin: Admin | undefined,
	customFields: CustomField[],
	timeRangeField: SelectOption,
): BackendSearchQuery => {
	const defaultTimeRangeRule = getDefaultTimeRangeRule(timeRangeField)

	const { isAnd, rules: serializedRules }: { isAnd: boolean; rules: any } =
		JSON.parse(searchQuery)
	const rules = deserializeRules(serializedRules)

	const isNegative = (op: Operator): boolean =>
		[
			'is_not',
			'not_contains',
			'not_exists',
			'not_between',
			'not_between_time',
			'not_between_date',
			'not_matches',
		].includes(op)

	const parseGroup = (
		isAnd: boolean,
		rules: RuleProps[],
	): OpenSearchQuery => {
		const parseInner = (
			field: SelectOption,
			op: Operator,
			value?: string,
		): any => {
			const getCustomFieldOptions = (field: SelectOption | undefined) => {
				if (!field) {
					return undefined
				}

				const type = getType(field.value)
				if (
					![
						CUSTOM_TYPE,
						SESSION_TYPE,
						ERROR_TYPE,
						ERROR_FIELD_TYPE,
					].includes(type)
				) {
					return undefined
				}

				return customFields.find((f) => f.name === field.label)?.options
			}

			if (
				[CUSTOM_TYPE, ERROR_TYPE, ERROR_FIELD_TYPE].includes(
					getType(field.value),
				)
			) {
				const name = field.label
				const isKeyword = !(
					getCustomFieldOptions(field)?.type !== 'text'
				)

				if (field.label === 'viewed_by_me' && admin) {
					const baseQuery = {
						term: {
							[`viewed_by_admins.id`]: admin.id,
						},
					}

					if (value === 'true') {
						return {
							...baseQuery,
						}
					}
					return {
						bool: {
							must_not: {
								...baseQuery,
							},
						},
					}
				}

				switch (op) {
					case 'is':
						return {
							term: {
								[`${name}${isKeyword ? '.keyword' : ''}`]:
									value,
							},
						}
					case 'contains':
						return {
							wildcard: {
								[`${name}${
									isKeyword ? '.keyword' : ''
								}`]: `*${value}*`,
							},
						}
					case 'matches':
						return {
							regexp: {
								[`${name}${isKeyword ? '.keyword' : ''}`]:
									value,
							},
						}
					case 'exists':
						return { exists: { field: name } }
					case 'between_date':
						return {
							range: {
								[name]: {
									gte: getAbsoluteStartTime(value),
									lte: getAbsoluteEndTime(value),
								},
							},
						}
					case 'between_time':
						return {
							range: {
								[name]: {
									gte:
										Number(value?.split('_')[0]) *
										60 *
										1000,
									...(Number(value?.split('_')[1]) ===
									TIME_MAX_LENGTH
										? null
										: {
												lte:
													Number(
														value?.split('_')[1],
													) *
													60 *
													1000,
										  }),
								},
							},
						}
					case 'between':
						return {
							range: {
								[name]: {
									gte: Number(value?.split('_')[0]),
									...(Number(value?.split('_')[1]) ===
									RANGE_MAX_LENGTH
										? null
										: {
												lte: Number(
													value?.split('_')[1],
												),
										  }),
								},
							},
						}
				}
			} else {
				const key = field.value
				switch (op) {
					case 'is':
						return {
							term: {
								'fields.KeyValue': `${key}_${value}`,
							},
						}
					case 'contains':
						return {
							wildcard: {
								'fields.KeyValue': `${key}_*${value}*`,
							},
						}
					case 'matches':
						return {
							regexp: {
								'fields.KeyValue': `${key}_${value}`,
							},
						}
					case 'exists':
						return { term: { 'fields.Key': key } }
				}
			}
		}

		const NEGATION_MAP: { [K in Operator]: Operator } = {
			is: 'is_not',
			is_not: 'is',
			contains: 'not_contains',
			not_contains: 'contains',
			exists: 'not_exists',
			not_exists: 'exists',
			between: 'not_between',
			not_between: 'between',
			between_time: 'not_between_time',
			not_between_time: 'between_time',
			between_date: 'not_between_date',
			not_between_date: 'between_date',
			matches: 'not_matches',
			not_matches: 'matches',
		}

		const parseRuleImpl = (
			field: SelectOption,
			op: Operator,
			multiValue: MultiselectOption,
		): any => {
			if (isNegative(op)) {
				return {
					bool: {
						must_not: {
							...parseRuleImpl(
								field,
								NEGATION_MAP[op],
								multiValue,
							),
						},
					},
				}
			} else if (hasArguments(op)) {
				return {
					bool: {
						should: multiValue.options.map(({ value }) =>
							parseInner(field, op, value),
						),
					},
				}
			} else {
				return parseInner(field, op)
			}
		}

		const parseRule = (rule: RuleProps): any => {
			const field = rule.field!
			const multiValue = rule.val!
			const op = rule.op!

			return parseRuleImpl(field, op, multiValue)
		}

		const condition = isAnd ? 'must' : 'should'
		const filterErrors = rules.some(
			(r) => getType(r.field!.value) === ERROR_FIELD_TYPE,
		)
		const timeRange =
			rules.find(
				(rule) =>
					rule.field?.value === defaultTimeRangeRule.field!.value,
			) ?? defaultTimeRangeRule

		const timeRule = parseRule(timeRange)

		const errorObjectRules = rules
			.filter(
				(r) =>
					getType(r.field!.value) === ERROR_FIELD_TYPE &&
					r !== timeRange,
			)
			.map(parseRule)

		const standardRules = rules
			.filter(
				(r) =>
					getType(r.field!.value) !== ERROR_FIELD_TYPE &&
					r !== timeRange,
			)
			.map(parseRule)

		const request: OpenSearchQuery = { query: {} }

		if (filterErrors) {
			const errorGroupFilter = {
				bool: {
					[condition]: standardRules,
				},
			}
			const errorObjectFilter = {
				bool: {
					must: [
						timeRule,
						{
							bool: {
								[condition]: errorObjectRules,
							},
						},
					],
				},
			}
			request.query = {
				bool: {
					must: [
						errorGroupFilter,
						{
							has_child: {
								type: 'child',
								query: errorObjectFilter,
							},
						},
					],
				},
			}
			request.childQuery = {
				bool: {
					must: [
						{
							has_parent: {
								parent_type: 'parent',
								query: errorGroupFilter,
							},
						},
						errorObjectFilter,
					],
				},
			}
		} else {
			request.query = {
				bool: {
					must: [
						timeRule,
						{
							bool: {
								[condition]: standardRules,
							},
						},
					],
				},
			}
		}
		return request
	}

	const timeRange =
		rules.find(
			(rule) => rule.field?.value === defaultTimeRangeRule.field!.value,
		) ?? defaultTimeRangeRule

	const startDate = roundFeedDate(
		getAbsoluteStartTime(timeRange.val?.options[0].value),
	)
	const endDate = roundFeedDate(
		getAbsoluteEndTime(timeRange.val?.options[0].value),
	)
	const backendSearchQuery = parseGroup(isAnd, rules)
	return {
		searchQuery: JSON.stringify(backendSearchQuery.query),
		childSearchQuery: backendSearchQuery.childQuery
			? JSON.stringify(backendSearchQuery.childQuery)
			: undefined,
		startDate,
		endDate,
		histogramBucketSize: GetHistogramBucketSize(
			moment.duration(endDate.diff(startDate)),
		),
	}
}
