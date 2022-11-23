import { useAuthContext } from '@authentication/AuthContext'
import { RESET_PAGE_MS, STARTING_PAGE } from '@components/Pagination/Pagination'
import {
	CustomField,
	CustomFieldType,
	OptionKind,
	SelectOption,
} from '@components/QueryBuilder/field'
import { OperatorName } from '@components/QueryBuilder/operator'
import { parseQuery, Rule } from '@components/QueryBuilder/rule'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { EmptyErrorsSearchParams } from '@pages/Errors/ErrorsPage'
import { SessionPageSearchParams } from '@pages/Player/utils/utils'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useLocalStorage, useToggle } from 'react-use'
import { NumberParam, useQueryParams } from 'use-query-params'

export const TIME_RANGE_FIELD: SelectOption = {
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

export const WithErrorSearchContext: React.FC<
	React.PropsWithChildren<unknown>
> = ({ children }) => {
	const { project_id: projectId } = useParams<{
		project_id: string
	}>()

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
	const searchParamsChangedOn = useRef<Date>()

	const [paginationToUrlParams, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

	const [backendSearchQuery, setBackendSearchQuery] =
		useState<BackendSearchQuery>(undefined)

	const history = useHistory()
	const { queryBuilderInput, setQueryBuilderInput } = useSearchContext()
	const [page, setPage] = useState<number>()

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

	const errorSearchContext = {
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
	}

	useEffect(
		() => setCachedParams(searchParams),
		[searchParams, setCachedParams],
	)

	useEffect(() => {
		if (dateFromSearchParams) {
			const start_date = moment(
				moment(dateFromSearchParams).format('MM/DD/YYYY HH:mm'),
			)
			const end_date = moment(
				moment(dateFromSearchParams).format('MM/DD/YYYY HH:mm'),
			)

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
			searchParamsChangedOn.current &&
			new Date().getTime() - searchParamsChangedOn.current.getTime() >
				RESET_PAGE_MS
		) {
			// the search query actually changed, reset the page
			setPage(STARTING_PAGE)
		}
		searchParamsChangedOn.current = new Date()
	}, [searchParams, setPage])

	return (
		<ErrorSearchContextProvider value={errorSearchContext}>
			{children}
		</ErrorSearchContextProvider>
	)
}
