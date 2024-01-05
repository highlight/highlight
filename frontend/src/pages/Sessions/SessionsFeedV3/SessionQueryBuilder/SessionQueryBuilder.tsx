import {
	useEditSegmentMutation,
	useGetFieldsClickhouseQuery,
	useGetFieldTypesClickhouseQuery,
	useGetSegmentsQuery,
} from '@graph/hooks'
import { useProjectId } from '@hooks/useProjectId'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import React, { useCallback } from 'react'

import QueryBuilder, {
	BOOLEAN_OPERATORS,
	CUSTOM_TYPE,
	CustomField,
	deserializeRules,
	FetchFieldVariables,
	getAbsoluteEndTime,
	getAbsoluteStartTime,
	QueryBuilderProps,
	RANGE_OPERATORS,
	SelectOption,
	TIME_OPERATORS,
} from '@/components/QueryBuilder/QueryBuilder'
import { CreateSegmentModal } from '@/pages/Sessions/SearchSidebar/SegmentModals/CreateSegmentModal'
import { DeleteSessionSegmentModal } from '@/pages/Sessions/SearchSidebar/SegmentModals/DeleteSessionSegmentModal'

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

export const CUSTOM_FIELDS: CustomField[] = [
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
			operators: BOOLEAN_OPERATORS,
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'viewed_by_me',
		options: {
			type: 'boolean',
			operators: BOOLEAN_OPERATORS,
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
			operators: BOOLEAN_OPERATORS,
		},
	},
	{
		type: CUSTOM_TYPE,
		name: 'first_time',
		options: {
			type: 'boolean',
			operators: BOOLEAN_OPERATORS,
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
	{
		type: CUSTOM_TYPE,
		name: 'sample',
		options: {
			type: 'sample',
			operators: ['is_editable'],
		},
	},
]

const SessionQueryBuilder = React.memo((props: Partial<QueryBuilderProps>) => {
	const { refetch } = useGetFieldsClickhouseQuery({
		skip: true,
		fetchPolicy: 'cache-and-network',
	})
	const fetchFields = useCallback(
		(variables: FetchFieldVariables) =>
			refetch(variables).then((r) => r.data.fields_clickhouse),
		[refetch],
	)

	const { projectId } = useProjectId()

	const searchContext = useSearchContext()

	const { rules: serializedRules }: { rules: any } = JSON.parse(
		searchContext.searchQuery,
	)
	const newRules = deserializeRules(serializedRules)
	const timeRange = newRules.find(
		(rule) => rule.field?.value === TIME_RANGE_FIELD.value,
	)

	const startDate = getAbsoluteStartTime(timeRange?.val?.options[0].value)
	const endDate = getAbsoluteEndTime(timeRange?.val?.options[0].value)
	const { data: fieldData } = useGetFieldTypesClickhouseQuery({
		variables: {
			project_id: projectId,
			start_date: startDate!,
			end_date: endDate!,
		},
		skip: !projectId,
		fetchPolicy: 'cache-and-network',
	})

	return (
		<QueryBuilder
			searchContext={searchContext}
			timeRangeField={props.timeRangeField ?? TIME_RANGE_FIELD}
			customFields={props.customFields ?? CUSTOM_FIELDS}
			fetchFields={props.fetchFields ?? fetchFields}
			fieldData={props.fieldData ?? fieldData}
			useEditAnySegmentMutation={useEditSegmentMutation}
			useGetAnySegmentsQuery={useGetSegmentsQuery}
			CreateAnySegmentModal={CreateSegmentModal}
			DeleteAnySegmentModal={DeleteSessionSegmentModal}
			{...props}
		/>
	)
})
export default SessionQueryBuilder
