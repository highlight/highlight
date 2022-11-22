import { useAuthContext } from '@authentication/AuthContext'
import { ErrorState } from '@components/ErrorState/ErrorState'
import { RESET_PAGE_MS, STARTING_PAGE } from '@components/Pagination/Pagination'
import {
	CustomField,
	CustomFieldType,
	OptionKind,
	SelectOption,
} from '@components/QueryBuilder/field'
import { OperatorName } from '@components/QueryBuilder/operator'
import { parseQuery, Rule } from '@components/QueryBuilder/rule'
import { Skeleton } from '@components/Skeleton/Skeleton'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import {
	useGetErrorGroupQuery,
	useMuteErrorCommentThreadMutation,
} from '@graph/hooks'
import { ErrorSearchParamsInput } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	IconChevronDown,
	IconChevronUp,
	IconExitRight,
} from '@highlight-run/ui'
import { getHeaderFromError } from '@pages/Error/ErrorPage'
import useErrorPageConfiguration from '@pages/Error/utils/ErrorPageUIConfiguration'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import ErrorBody from '@pages/ErrorsV2/ErrorBody/ErrorBody'
import ErrorInstance from '@pages/ErrorsV2/ErrorInstance/ErrorInstance'
import ErrorTitle from '@pages/ErrorsV2/ErrorTitle/ErrorTitle'
import NoActiveErrorCard from '@pages/ErrorsV2/NoActiveErrorCard/NoActiveErrorCard'
import SearchPanel from '@pages/ErrorsV2/SearchPanel/SearchPanel'
import { controlBar } from '@pages/ErrorsV2/SearchPanel/SearchPanel.css'
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router'
import { useLocalStorage, useToggle } from 'react-use'
import { NumberParam, useQueryParams } from 'use-query-params'

import styles from './ErrorsV2.module.scss'

const TIME_RANGE_FIELD: SelectOption = {
	kind: OptionKind.SINGLE,
	label: 'timestamp',
	value: 'error-field_timestamp',
}

const CUSTOM_FIELDS: CustomField[] = [
	{
		type: CustomFieldType.ERROR,
		name: 'Type',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR,
		name: 'Event',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR,
		name: 'state',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR_FIELD,
		name: 'browser',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR_FIELD,
		name: 'os_name',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR_FIELD,
		name: 'visited_url',
		options: {
			type: 'text',
		},
	},
	{
		type: CustomFieldType.ERROR_FIELD,
		name: 'environment',
		options: {
			type: 'text',
		},
	},
]

const ErrorsV2: React.FC<React.PropsWithChildren> = () => {
	const { error_secure_id, project_id: projectId } = useParams<{
		error_secure_id: string
		project_id: string
	}>()
	const { isLoggedIn } = useAuthContext()
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
			}-${projectId}`,
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

	const { showLeftPanel, setShowLeftPanel } = useErrorPageConfiguration()
	const [rules, setRules] = useState<Rule[]>([])
	const [isAnd, toggleIsAnd] = useToggle(true)

	const defaultTimeRangeRule: Rule = useMemo(() => {
		const period =
			projectId === '0'
				? {
						label: 'Last 5 years',
						value: '5 years',
				  }
				: {
						label: 'Last 30 days',
						value: '30 days',
				  }

		return new Rule(
			TIME_RANGE_FIELD,
			{ name: OperatorName.BETWEEN_DATE },
			{
				kind: OptionKind.MULTI,
				options: [period],
			},
		)
	}, [projectId])

	const { admin } = useAuthContext()

	const update = useCallback(() => {
		const parsedQuery = parseQuery(rules, isAnd, defaultTimeRangeRule, {
			admin,
			customFields: CUSTOM_FIELDS,
		})
		setBackendSearchQuery(parsedQuery)
	}, [admin, defaultTimeRangeRule, isAnd, rules, setBackendSearchQuery])

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
				rules,
				setRules,
				isAnd,
				toggleIsAnd,
				update,
			}}
		>
			<Helmet>
				<title>Errors</title>
			</Helmet>

			<div className={styles.container}>
				<SearchPanel />

				<div
					className={classNames(styles.detailsContainer, {
						[styles.moveDetailsRight]: showLeftPanel,
					})}
				>
					{!integrated && <IntegrationCard />}

					<Box
						display="flex"
						flexDirection="column"
						style={{ height: '100%' }}
					>
						<Box
							display="flex"
							alignItems="center"
							px="12"
							borderBottom="neutral"
							cssClass={controlBar}
						>
							<Box display="flex" gap="8">
								{!showLeftPanel && (
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="medium"
										icon={<IconExitRight size={14} />}
										onClick={() => setShowLeftPanel(true)}
									/>
								)}
								<Box
									borderRadius="6"
									border="neutral"
									overflow="hidden"
									display="flex"
								>
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="low"
										icon={<IconChevronUp size={14} />}
										cssClass={styles.sessionSwitchButton}
									/>
									<Box as="span" borderRight="neutral" />
									<ButtonIcon
										kind="secondary"
										size="small"
										shape="square"
										emphasis="low"
										icon={<IconChevronDown size={14} />}
										cssClass={styles.sessionSwitchButton}
									/>
								</Box>
							</Box>
						</Box>
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

								<div className={styles.errorDetails}>
									{loading ? (
										<>
											<Skeleton
												count={1}
												style={{
													width: 300,
													height: 37,
												}}
											/>

											<Skeleton
												count={1}
												style={{
													height: '2ch',
													marginBottom: 0,
												}}
											/>
										</>
									) : (
										<div>
											<ErrorTitle
												errorGroup={data?.error_group}
											/>

											<ErrorBody
												errorGroup={data?.error_group}
											/>

											<ErrorInstance
												errorGroup={data?.error_group}
											/>
										</div>
									)}
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
					</Box>
				</div>
			</div>
		</ErrorSearchContextProvider>
	)
}

export default ErrorsV2
