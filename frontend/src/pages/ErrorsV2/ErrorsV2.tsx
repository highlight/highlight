import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { RESET_PAGE_MS, STARTING_PAGE } from '@components/Pagination/Pagination'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import {
	useGetErrorGroupQuery,
	useGetRecentErrorsQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import { CreateModalType } from '@pages/Error/components/ErrorCreateCommentModal/ErrorCreateCommentModal'
import NoActiveErrorCard from '@pages/Error/components/ErrorRightPanel/components/NoActiveErrorCard/NoActiveErrorCard'
import ErrorSearchPanel from '@pages/Error/components/ErrorSearchPanel/ErrorSearchPanel'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import {
	ErrorSearchContextProvider,
	ErrorSearchParams,
} from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import { SessionPageSearchParams } from '@pages/Player/utils/utils'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import classNames from 'classnames'
import { H } from 'highlight.run'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocalStorage } from 'react-use'
import { useQueryParams, NumberParam } from 'use-query-params'
import { useHistory } from 'react-router'

import styles from './ErrorsV2.module.scss'
import { useIntegrated } from '@util/integrated'
import { IntegrationCard } from '@pages/Sessions/IntegrationCard/IntegrationCard'

interface Props {}

const ErrorsV2: React.FC<React.PropsWithChildren<Props>> = (props) => {
	const { error_secure_id, project_id } = useParams<{
		error_secure_id: string
		project_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
	const { showLeftPanel } = useErrorPageConfiguration()
	const { showBanner } = useGlobalContext()
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
	const [cachedParams, setCachedParams] = useLocalStorage<ErrorSearchParams>(
		`cachedErrorParams-v2-${
			segmentName || 'no-selected-segment'
		}-${project_id}`,
		{},
	)
	const [searchParams, setSearchParams] = useState<ErrorSearchParams>(
		cachedParams || EmptyErrorsSearchParams,
	)
	const [searchResultsLoading, setSearchResultsLoading] =
		useState<boolean>(false)
	const [existingParams, setExistingParams] = useState<ErrorSearchParams>({})
	const newCommentModalRef = useRef<HTMLDivElement>(null)
	const dateFromSearchParams = new URLSearchParams(location.search).get(
		SessionPageSearchParams.date,
	)
	const searchParamsChanged = useRef<Date>()
	const [deepLinkedCommentId, setDeepLinkedCommentId] = useState(
		new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		),
	)

	const [paginationToUrlParams, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

	const [muteErrorCommentThread] = useMuteErrorCommentThreadMutation()
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search)

		const commentId = urlParams.get(PlayerSearchParameters.commentId)
		setDeepLinkedCommentId(commentId)

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
				// We are explicitly clearing any existing search params so the only applied search param is the date range.
				...EmptyErrorsSearchParams,
				date_range: {
					start_date: start_date
						.startOf('day')
						.subtract(1, 'days')
						.toDate(),
					end_date: end_date.endOf('day').toDate(),
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
	const [showCreateCommentModal, setShowCreateCommentModal] =
		useState<CreateModalType>(CreateModalType.None)
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

	// TODO: Loading state.
	if (loading) {
		return null
	}

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
			<div
				className={classNames(styles.errorPage, {
					[styles.withoutLeftPanel]: !showLeftPanel,
					[styles.empty]: !error_secure_id || errorQueryingErrorGroup,
					[styles.withErrorState]: errorQueryingErrorGroup,
				})}
			>
				<div
					className={classNames(styles.errorPageLeftColumn, {
						[styles.hidden]: !showLeftPanel,
					})}
				>
					<ErrorSearchPanel />
				</div>
				<Helmet>
					<title>Errors</title>
				</Helmet>
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
							className={classNames(
								styles.errorPageCenterColumn,
								{
									[styles.hidden]: !showLeftPanel,
									[styles.bannerShown]: showBanner,
								},
							)}
						></div>
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
		</ErrorSearchContextProvider>
	)
}

export default ErrorsV2
