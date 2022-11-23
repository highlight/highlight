import { Rule } from '@components/QueryBuilder/rule'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import { SearchParamsInput } from '@graph/schemas'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import {
	QueryBuilderInput,
	SearchContextProvider,
} from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { FieldArrayParam, QueryBuilderStateParam } from '@util/url/params'
import isEqual from 'lodash/isEqual'
import { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useLocalStorage, useToggle } from 'react-use'
import {
	ArrayParam,
	BooleanParam,
	JsonParam,
	NumberParam,
	StringParam,
	useQueryParam,
	useQueryParams,
} from 'use-query-params'

const InitialSearchParamsForUrl = {
	browser: undefined,
	date_range: undefined,
	device_id: undefined,
	excluded_properties: undefined,
	excluded_track_properties: undefined,
	first_time: undefined,
	hide_viewed: undefined,
	identified: undefined,
	length_range: undefined,
	os: undefined,
	referrer: undefined,
	track_properties: undefined,
	user_properties: undefined,
	visited_url: undefined,
	show_live_sessions: undefined,
	environments: undefined,
	app_versions: undefined,
}

export const WithSessionSearchContext: React.FC<
	React.PropsWithChildren<unknown>
> = ({ children }) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [segmentName, setSegmentName] = useState<string | null>(null)
	const [showStarredSessions, setShowStarredSessions] =
		useState<boolean>(false)
	const [searchParams, setSearchParams] = useState<SearchParamsInput>(
		EmptySessionsSearchParams,
	)
	const [searchResultsLoading, setSearchResultsLoading] =
		useState<boolean>(false)
	const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false)

	const [page, setPage] = useState<number>()

	const [selectedSegment, setSelectedSegment] = useLocalStorage<
		{ value: string; id: string } | undefined
	>(
		`highlightSegmentPickerForPlayerSelectedSegmentId-${project_id}`,
		undefined,
	)

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)

	const [queryBuilderInput, setQueryBuilderInput] =
		useState<QueryBuilderInput>(undefined)

	const [existingParams, setExistingParams] = useState<SearchParamsInput>(
		EmptySessionsSearchParams,
	)

	const [rules, setRules] = useState<Rule[]>([])
	const [isAnd, toggleIsAnd] = useToggle(true)

	const sessionSearchContext = {
		searchParams,
		setSearchParams,
		existingParams,
		setExistingParams,
		segmentName,
		setSegmentName,
		showStarredSessions,
		setShowStarredSessions,
		selectedSegment,
		setSelectedSegment,
		backendSearchQuery,
		setBackendSearchQuery,
		queryBuilderInput,
		setQueryBuilderInput,
		isQuickSearchOpen,
		setIsQuickSearchOpen,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		rules,
		setRules,
		isAnd,
		toggleIsAnd,
	}

	// Params and hooks for SearchContextProvider

	const [searchParamsToUrlParams, setSearchParamsToUrlParams] =
		useQueryParams({
			user_properties: FieldArrayParam,
			identified: BooleanParam,
			browser: StringParam,
			date_range: JsonParam,
			excluded_properties: FieldArrayParam,
			hide_viewed: BooleanParam,
			length_range: JsonParam,
			os: StringParam,
			referrer: StringParam,
			track_properties: FieldArrayParam,
			excluded_track_properties: FieldArrayParam,
			visited_url: StringParam,
			first_time: BooleanParam,
			device_id: StringParam,
			show_live_sessions: BooleanParam,
			environments: ArrayParam,
			app_versions: ArrayParam,
			query: QueryBuilderStateParam,
		})
	const [activeSegmentUrlParam, setActiveSegmentUrlParam] = useQueryParam(
		'segment',
		JsonParam,
	)

	const [paginationToUrlParams, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

	const sessionsMatch = useRouteMatch('/:project_id/sessions')

	useEffect(() => {
		const areAnySearchParamsSet = !isEqual(
			EmptySessionsSearchParams,
			searchParams,
		)

		// Handles the case where the user is loading the page from a link shared from another user that has search params in the URL.
		if (!segmentName && areAnySearchParamsSet) {
			// `undefined` values will not be persisted to the URL.
			// Because of that, we only want to change the values from `undefined`
			// to the actual value when the value is different to the empty state.
			const searchParamsToReflectInUrl = { ...InitialSearchParamsForUrl }
			Object.keys(searchParams).forEach((key) => {
				// @ts-expect-error
				const currentSearchParam = searchParams[key]
				// @ts-expect-error
				const emptySearchParam = EmptySessionsSearchParams[key]
				if (Array.isArray(currentSearchParam)) {
					if (currentSearchParam.length !== emptySearchParam.length) {
						// @ts-expect-error
						searchParamsToReflectInUrl[key] = currentSearchParam
					}
				} else if (currentSearchParam !== emptySearchParam) {
					// @ts-expect-error
					searchParamsToReflectInUrl[key] = currentSearchParam
				}
			})

			// Only do this on the session page.
			// We don't do this on other pages because we use search params to represent state
			// For example, on the /alerts page we use `code` to store the Slack code when the OAuth redirect.
			// If we run this, it'll remove the code and the integration will fail.
			if (sessionsMatch) {
				setSearchParamsToUrlParams(
					{
						...searchParamsToReflectInUrl,
					},
					'replaceIn',
				)
			}
		}
	}, [setSearchParamsToUrlParams, searchParams, segmentName, sessionsMatch])

	useEffect(() => {
		if (page !== undefined) {
			setPaginationToUrlParams(
				{
					page: page,
				},
				'replaceIn',
			)
		}
	}, [setPaginationToUrlParams, page])

	useEffect(() => {
		if (!isEqual(InitialSearchParamsForUrl, searchParamsToUrlParams)) {
			setSearchParams(searchParamsToUrlParams as SearchParamsInput)
		}
		if (paginationToUrlParams.page && page != paginationToUrlParams.page) {
			setPage(paginationToUrlParams.page)
		}
		// We only want to run this on mount (i.e. when the page first loads).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Session Segment Deep Linking
	useEffect(() => {
		// Only this effect on the sessions page
		if (!sessionsMatch) {
			return
		}

		if (selectedSegment && selectedSegment.id && selectedSegment.value) {
			if (!isEqual(activeSegmentUrlParam, selectedSegment)) {
				setActiveSegmentUrlParam(selectedSegment, 'replace')
			}
		} else if (activeSegmentUrlParam !== undefined) {
			setActiveSegmentUrlParam(undefined, 'replace')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSegment, sessionsMatch, setActiveSegmentUrlParam])

	useEffect(() => {
		if (activeSegmentUrlParam) {
			setSelectedSegment(activeSegmentUrlParam)
		}
		// We only want to run this on mount (i.e. when the page first loads).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<SearchContextProvider value={sessionSearchContext}>
			{children}
		</SearchContextProvider>
	)
}
