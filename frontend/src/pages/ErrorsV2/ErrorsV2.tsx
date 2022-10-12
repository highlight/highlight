import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { RESET_PAGE_MS, STARTING_PAGE } from '@components/Pagination/Pagination'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import {
	useGetErrorGroupQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { SessionPageSearchParams } from '@pages/Player/utils/utils'
import { IntegrationCard } from '@pages/Sessions/IntegrationCard/IntegrationCard'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useIntegrated } from '@util/integrated'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import { H } from 'highlight.run'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'
import { useLocalStorage } from 'react-use'
import { NumberParam, useQueryParams } from 'use-query-params'

import styles from './ErrorsV2.module.scss'

const ErrorsV2: React.FC<React.PropsWithChildren> = () => {
	const { error_secure_id, project_id } = useParams<{
		error_secure_id: string
		project_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
	const { showLeftPanel } = useErrorPageConfiguration()
	const { queryBuilderInput, setQueryBuilderInput } = useSearchContext()
	const integrated = useIntegrated()

	const {
		data,
		loading,
		error: errorQueryingErrorGroup,
	} = useGetErrorGroupQuery({
		variables: { secure_id: error_secure_id },
		skip: !error_secure_id,
		onCompleted: () => {
			H.track('Viewed error', { is_guest: !isLoggedIn })
		},
	})

	const history = useHistory()

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
	const [existingParams, setExistingParams] =
		useState<ErrorSearchParamsInput>({})
	const dateFromSearchParams = new URLSearchParams(location.search).get(
		SessionPageSearchParams.date,
	)
	const searchParamsChanged = useRef<Date>()

	const [paginationToUrlParams, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)

		const commentId = urlParams.get(PlayerSearchParameters.commentId)

		const hasMuted = urlParams.get(PlayerSearchParameters.muted) === '1'
		if (commentId && hasMuted) {
			muteErrorCommentThread({
				variables: {
					id: commentId,
					has_muted: hasMuted,
				},
			}).then(() => {
				const searchParams = new URLSearchParams(location.search)
				searchParams.delete(PlayerSearchParameters.muted)
				history.replace(
					`${history.location.pathname}?${searchParams.toString()}`,
				)

				message.success('Muted notifications for this comment thread.')
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	useEffect(
		() => setCachedParams(searchParams),
		[searchParams, setCachedParams],
	)

	useEffect(() => {
		if (dateFromSearchParams) {
			const start_date = moment(dateFromSearchParams)
			const end_date = moment(dateFromSearchParams)

			setSearchParams(() => ({
				// We are explicitly clearing any existing search params so the only
				// applied search param is the date range.
				...EmptyErrorsSearchParams,
				date_range: {
					start_date: start_date
						.startOf('day')
						.subtract(1, 'days')
						.format(),
					end_date: end_date.endOf('day').format(),
				},
			}))
			message.success(
				`Showing errors that were thrown on ${dateFromSearchParams}`,
			)
			history.replace({ search: '' })
		}
	}, [history, dateFromSearchParams, setSearchParams])

	useEffect(() => {
		if (queryBuilderInput?.type === 'errors') {
			setSearchParams({
				...EmptyErrorsSearchParams,
				query: JSON.stringify(queryBuilderInput),
			})
			setQueryBuilderInput(undefined)
		}
	}, [queryBuilderInput, setQueryBuilderInput])

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)
	const [page, setPage] = useState<number>()

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

	return (
		<ErrorSearchContextProvider
			value={{
				// TODO: See if we can clean this up...
				searchParams,
				setSearchParams,
				existingParams,
				setExistingParams,
				segmentName,
				setSegmentName,
				backendSearchQuery,
				setBackendSearchQuery,
				page,
				setPage,
				searchResultsLoading,
				setSearchResultsLoading,
			}}
		>
			<Helmet>
				<title>Errors</title>
			</Helmet>

			<div
				className={classNames(styles.container, {
					[styles.withErrorState]: errorQueryingErrorGroup,
				})}
			>
				<div
					className={classNames(styles.searchContainer, {
						[styles.hidden]: !showLeftPanel,
					})}
				>
					<SearchPanel />
				</div>

				<div className={styles.detailsContainer}>
					{!integrated && <IntegrationCard />}
					{error_secure_id && !errorQueryingErrorGroup ? (
						<>
							<Helmet>
								<title>
									Errors:{' '}
									{getHeaderFromError(
										data?.error_group?.event ?? [],
									)}
								</title>
							</Helmet>

							<div
								className={classNames(styles.detailsContainer, {
									[styles.hidden]: !showLeftPanel,
								})}
							>
								<div className={styles.titleContainer}>
									{loading ? (
										<Skeleton
											count={1}
											style={{ width: 300, height: 37 }}
										/>
									) : (
										<ErrorTitle
											errorGroup={data?.error_group}
										/>
									)}
								</div>
							</div>
						</>
					) : errorQueryingErrorGroup ? (
						<ErrorState
							shownWithHeader
							message="This error does not exist or has not been made public."
						/>
					) : (
						<NoActiveErrorCard />
					)}
				</div>
			</div>
		</ErrorSearchContextProvider>
	)
}

export default ErrorsV2
