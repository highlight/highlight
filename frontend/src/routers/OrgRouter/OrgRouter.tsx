import 'firebase/auth'

import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { Header } from '@components/Header/Header'
import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import { RESET_PAGE_MS, STARTING_PAGE } from '@components/Pagination/Pagination'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import { useGetProjectDropdownOptionsQuery } from '@graph/hooks'
import { ErrorSearchParamsInput, SearchParamsInput } from '@graph/schemas'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import FrontPlugin from '@pages/FrontPlugin/FrontPlugin'
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams'
import {
	QueryBuilderInput,
	SearchContextProvider,
	useSearchContext,
} from '@pages/Sessions/SearchContext/SearchContext'
import useLocalStorage from '@rehooks/local-storage'
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext'
import { useIntegrated } from '@util/integrated'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { useParams } from '@util/react-router/useParams'
import { FieldArrayParam, QueryBuilderStateParam } from '@util/url/params'
import classNames from 'classnames'
import Firebase from 'firebase/app'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { useToggle } from 'react-use'
import {
	ArrayParam,
	BooleanParam,
	JsonParam,
	NumberParam,
	StringParam,
	useQueryParam,
	useQueryParams,
} from 'use-query-params'

import commonStyles from '../../Common.module.scss'
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble'
import { ApplicationContextProvider } from './ApplicationContext'
import ApplicationRouter from './ApplicationRouter'

export const ProjectRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const [showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide] =
		useToggle(false)
	const [showBanner, toggleShowBanner] = useToggle(false)
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	const { data, loading, error } = useGetProjectDropdownOptionsQuery({
		variables: { project_id },
		skip: !isLoggedIn, // Higher level routers decide when guests are allowed to hit this router
	})

	const { integrated, loading: integratedLoading } = useIntegrated()
	const [hasFinishedOnboarding] = useLocalStorage(
		`highlight-finished-onboarding-${project_id}`,
		false,
	)

	useEffect(() => {
		const uri =
			import.meta.env.REACT_APP_PRIVATE_GRAPH_URI ??
			window.location.origin + '/private'
		let intervalId: NodeJS.Timeout
		Firebase.auth()
			.currentUser?.getIdToken()
			.then((t) => {
				const fetchToken = () => {
					fetch(`${uri}/project-token/${project_id}`, {
						credentials: 'include',
						headers: {
							token: t,
						},
					})
				}
				// Fetch a new token now and every 30 mins
				fetchToken()
				intervalId = setInterval(fetchToken, 30 * 60 * 1000)
			})
		return () => {
			clearInterval(intervalId)
		}
	}, [project_id])

	useEffect(() => {
		if (data?.workspace?.id) {
			window.Intercom('update', {
				company: {
					id: data?.workspace.id,
					name: data?.workspace.name,
				},
			})
		}
	}, [data?.workspace])

	useEffect(() => {
		if (!isOnPrem) {
			window.Intercom('update', {
				hide_default_launcher: true,
			})
		}
		return () => {
			if (!isOnPrem) {
				window.Intercom('update', {
					hide_default_launcher: false,
				})
			}
		}
	}, [])

	useEffect(() => {
		if (!error) {
			setLoadingState((previousLoadingState) => {
				if (previousLoadingState !== AppLoadingState.EXTENDED_LOADING) {
					return loading || integratedLoading
						? AppLoadingState.LOADING
						: AppLoadingState.LOADED
				}

				return AppLoadingState.EXTENDED_LOADING
			})
		} else {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [error, integratedLoading, loading, setLoadingState])

	if (loading || integratedLoading) {
		return null
	}

	// if the user can join this workspace, give them that option via the ErrorState
	const joinableWorkspace = data?.joinable_workspaces
		?.filter((w) => w?.projects.map((p) => p?.id).includes(project_id))
		?.pop()

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide,
				toggleShowKeyboardShortcutsGuide,
				showBanner,
				toggleShowBanner,
			}}
		>
			<ApplicationContextProvider
				value={{
					currentProject: data?.project || undefined,
					allProjects: data?.workspace?.projects || [],
					currentWorkspace: data?.workspace || undefined,
					workspaces: data?.workspaces || [],
				}}
			>
				<SearchContext>
					<ErrorSearchContext>
						<Switch>
							<Route path="/:project_id/front" exact>
								<FrontPlugin />
							</Route>
							<Route>
								<Header />
								<KeyboardShortcutsEducation />
								<div
									className={classNames(
										commonStyles.bodyWrapper,
										{
											[commonStyles.bannerShown]:
												showBanner,
										},
									)}
								>
									{/* Edge case: shareable links will still direct to this error page if you are logged in on a different project */}
									{isLoggedIn && joinableWorkspace ? (
										<ErrorState
											shownWithHeader
											joinableWorkspace={
												joinableWorkspace
											}
										/>
									) : isLoggedIn &&
									  (error || !data?.project) ? (
										<ErrorState
											title={'Enter this Workspace?'}
											message={`
                        Sadly, you don’t have access to the workspace 😢
                        Request access and we'll shoot an email to your workspace admin.
                        Alternatively, feel free to make an account!
                        `}
											shownWithHeader
											showRequestAccess
										/>
									) : (
										<>
											{isLoggedIn &&
												!hasFinishedOnboarding && (
													<>
														<OnboardingBubble />
													</>
												)}
											<ApplicationRouter
												integrated={integrated}
											/>
										</>
									)}
								</div>
							</Route>
						</Switch>
					</ErrorSearchContext>
				</SearchContext>
			</ApplicationContextProvider>
		</GlobalContextProvider>
	)
}

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

const SearchContext: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
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
	const [searchResultsCount, setSearchResultsCount] = useState<number>(0)
	const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false)

	const [page, setPage] = useState<number>()

	const [selectedSegment, setSelectedSegment, removeSelectedSegment] =
		useLocalStorage<{ value: string; id: string } | undefined>(
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
		removeSelectedSegment,
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
		searchResultsCount,
		setSearchResultsCount,
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
		const areAnySearchParamsSet = !_.isEqual(
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
					searchParamsToReflectInUrl,
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
		if (!_.isEqual(InitialSearchParamsForUrl, searchParamsToUrlParams)) {
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
			if (!_.isEqual(activeSegmentUrlParam, selectedSegment)) {
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

const InitialErrorSearchParamsForUrl = {
	query: undefined,
	segment_name: undefined,
}

const ErrorSearchContext: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [segmentName, setSegmentName] = useState<string | null>(null)

	const [cachedParams, setCachedParams] =
		useLocalStorage<ErrorSearchParamsInput>(
			`cachedErrorParams-v2-${
				segmentName || 'no-selected-segment'
			}-${project_id}`,
			{},
		)
	const [searchParams, setSearchParams] = useState<ErrorSearchParamsInput>(
		cachedParams || EmptyErrorsSearchParams,
	)
	const [searchResultsLoading, setSearchResultsLoading] =
		useState<boolean>(false)

	const [searchResultsCount, setSearchResultsCount] = useState<number>(0)
	const [searchResultSecureIds, setSearchResultSecureIds] = useState<
		string[]
	>([])

	const [existingParams, setExistingParams] =
		useState<ErrorSearchParamsInput>({})

	const searchParamsChanged = useRef<Date>()

	const [searchParamsToUrlParams, setSearchParamsToUrlParams] =
		useQueryParams({
			query: QueryBuilderStateParam,
		})

	const errorsMatch = useRouteMatch('/:project_id/errors')
	useEffect(() => {
		const areAnySearchParamsSet = !_.isEqual(
			EmptyErrorsSearchParams,
			searchParams,
		)
		if (!segmentName && areAnySearchParamsSet) {
			// `undefined` values will not be persisted to the URL.
			// Because of that, we only want to change the values from `undefined`
			// to the actual value when the value is different to the empty state.
			const searchParamsToReflectInUrl = {
				...InitialErrorSearchParamsForUrl,
			}
			Object.keys(searchParams).forEach((key) => {
				// @ts-expect-error
				const currentSearchParam = searchParams[key]
				// @ts-expect-error
				const emptySearchParam = EmptyErrorsSearchParams[key]
				if (!_.isEqual(currentSearchParam, emptySearchParam)) {
					// @ts-expect-error
					searchParamsToReflectInUrl[key] = currentSearchParam
				}
			})

			// Only do this on the errors page.
			if (errorsMatch) {
				setSearchParamsToUrlParams(
					searchParamsToReflectInUrl,
					'replaceIn',
				)
			}
		}
	}, [setSearchParamsToUrlParams, searchParams, segmentName, errorsMatch])

	const [activeSegmentUrlParam, setActiveSegmentUrlParam] = useQueryParam(
		'segment',
		JsonParam,
	)

	const [paginationToUrlParams, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)

	const { queryBuilderInput, setQueryBuilderInput } = useSearchContext()
	const [page, setPage] = useState<number>()

	const [selectedSegment, setSelectedSegment, removeSelectedSegment] =
		useLocalStorage<{ value: string; id: string } | undefined>(
			`highlightSegmentPickerForErrorsSelectedSegmentId-${project_id}`,
			undefined,
		)

	const errorSearchContext = {
		searchParams,
		setSearchParams,
		existingParams,
		setExistingParams,
		segmentName,
		setSegmentName,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
		backendSearchQuery,
		setBackendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
		searchResultsCount,
		setSearchResultsCount,
		searchResultSecureIds,
		setSearchResultSecureIds,
	}

	useEffect(
		() => setCachedParams(searchParams),
		[searchParams, setCachedParams],
	)

	useEffect(() => {
		if (queryBuilderInput?.type === 'errors') {
			setSearchParams({
				...EmptyErrorsSearchParams,
				query: JSON.stringify(queryBuilderInput),
			})
			setQueryBuilderInput(undefined)
		}
	}, [queryBuilderInput, setQueryBuilderInput])

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
		if (!_.isEqual(InitialSearchParamsForUrl, searchParamsToUrlParams)) {
			setSearchParams(searchParamsToUrlParams as SearchParamsInput)
		}

		if (paginationToUrlParams.page && page != paginationToUrlParams.page) {
			setPage(paginationToUrlParams.page)
		}
		// We only want to run this on mount (i.e. when the page first loads).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		// we just loaded the page for the first time
		if (
			searchParamsChanged.current &&
			new Date().getTime() - searchParamsChanged.current.getTime() >
				RESET_PAGE_MS
		) {
			// the search query actually changed, reset the page
			setPage(STARTING_PAGE)
		}
		searchParamsChanged.current = new Date()
	}, [searchParams, setPage])

	// Errors Segment Deep Linking
	useEffect(() => {
		// Only this effect on the sessions page
		if (!errorsMatch) {
			return
		}

		if (selectedSegment && selectedSegment.id && selectedSegment.value) {
			if (!_.isEqual(activeSegmentUrlParam, selectedSegment)) {
				setActiveSegmentUrlParam(selectedSegment, 'replace')
			}
		} else if (activeSegmentUrlParam !== undefined) {
			setActiveSegmentUrlParam(undefined, 'replace')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSegment, errorsMatch, setActiveSegmentUrlParam])

	useEffect(() => {
		if (activeSegmentUrlParam) {
			setSelectedSegment(activeSegmentUrlParam)
		}
		// We only want to run this on mount (i.e. when the page first loads).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<ErrorSearchContextProvider value={errorSearchContext}>
			{children}
		</ErrorSearchContextProvider>
	)
}
