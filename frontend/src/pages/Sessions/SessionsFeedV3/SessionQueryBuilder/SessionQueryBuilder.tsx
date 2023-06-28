import {
	useEditSegmentMutation,
	useGetFieldsOpensearchQuery,
	useGetFieldTypesQuery,
	useGetSegmentsQuery,
} from '@graph/hooks'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { useParams } from '@util/react-router/useParams'
import { isEqual } from 'lodash'
import React, { useEffect } from 'react'
import {
	JsonParam,
	NumberParam,
	useQueryParam,
	useQueryParams,
} from 'use-query-params'

import QueryBuilder, {
	BOOLEAN_OPERATORS,
	CUSTOM_TYPE,
	CustomField,
	FetchFieldVariables,
	RANGE_OPERATORS,
	SelectOption,
	TIME_OPERATORS,
	VIEWED_BY_OPERATORS,
} from '@/components/QueryBuilder/QueryBuilder'
import { EmptySessionsSearchParams } from '@/pages/Sessions/EmptySessionsSearchParams'
import CreateSegmentModal from '@/pages/Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal'
import DeleteSessionSegmentModal from '@/pages/Sessions/SearchSidebar/SegmentPicker/DeleteSessionSegmentModal/DeleteSessionSegmentModal'

export const InitialSearchParamsForUrl = {
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
} as const

export const TIME_RANGE_FIELD: SelectOption = {
	kind: 'single',
	label: 'created_at',
	value: 'custom_created_at',
}

const CUSTOM_FIELDS: CustomField[] = [
	{
		type: CUSTOM_TYPE,
		name: 'app_version',
		options: {
			type: 'text',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'active_length',
		options: {
			operators: TIME_OPERATORS,
			type: 'long',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'pages_visited',
		options: {
			operators: RANGE_OPERATORS,
			type: 'long',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'viewed',
		options: {
			type: 'boolean',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'viewed_by_me',
		options: {
			type: 'boolean',
			operators: VIEWED_BY_OPERATORS,
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'has_errors',
		options: {
			type: 'boolean',
			operators: BOOLEAN_OPERATORS,
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'has_rage_clicks',
		options: {
			type: 'boolean',
			operators: BOOLEAN_OPERATORS,
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'processed',
		options: {
			type: 'boolean',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'first_time',
		options: {
			type: 'boolean',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'starred',
		options: {
			type: 'boolean',
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'has_comments',
		options: {
			type: 'boolean',
			operators: BOOLEAN_OPERATORS,
		},
	},
]

const SessionQueryBuilder = React.memo((props: { readonly?: boolean }) => {
	const { refetch } = useGetFieldsOpensearchQuery({
		skip: true,
	})
	const fetchFields = (variables: FetchFieldVariables) =>
		refetch(variables).then((r) => r.data.fields_opensearch)

	const { project_id } = useParams<{
		project_id: string
	}>()
	const { data: fieldData } = useGetFieldTypesQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})
	const searchContext = useSearchContext()
	const { setShowLeftPanel } = usePlayerConfiguration()

	const { page, selectedSegment, setSelectedSegment } = searchContext

	const [activeSegmentUrlParam, setActiveSegmentUrlParam] = useQueryParam(
		'segment',
		JsonParam,
	)

	const [, setPaginationToUrlParams] = useQueryParams({
		page: NumberParam,
	})

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

	// Session Segment Deep Linking
	useEffect(() => {
		if (selectedSegment && selectedSegment.id && selectedSegment.name) {
			if (!isEqual(activeSegmentUrlParam, selectedSegment)) {
				setActiveSegmentUrlParam(selectedSegment, 'replace')
			}
		} else if (activeSegmentUrlParam !== undefined) {
			setActiveSegmentUrlParam(undefined, 'replace')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedSegment, setActiveSegmentUrlParam])

	useEffect(() => {
		if (activeSegmentUrlParam) {
			setSelectedSegment(activeSegmentUrlParam)
		}
		// We only want to run this on mount (i.e. when the page first loads).
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<QueryBuilder
			searchContext={useSearchContext()}
			timeRangeField={TIME_RANGE_FIELD}
			customFields={CUSTOM_FIELDS}
			fetchFields={fetchFields}
			fieldData={fieldData}
			setShowLeftPanel={setShowLeftPanel}
			emptySearchParams={EmptySessionsSearchParams}
			useEditAnySegmentMutation={useEditSegmentMutation}
			useGetAnySegmentsQuery={useGetSegmentsQuery}
			CreateAnySegmentModal={CreateSegmentModal}
			DeleteAnySegmentModal={DeleteSessionSegmentModal}
			{...props}
		/>
	)
})
export default SessionQueryBuilder
