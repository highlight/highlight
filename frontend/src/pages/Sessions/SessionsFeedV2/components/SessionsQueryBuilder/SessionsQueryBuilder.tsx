import {
	useGetFieldsOpensearchQuery,
	useGetFieldTypesQuery,
} from '@graph/hooks'
import {
	SearchParams,
	useSearchContext,
} from '@pages/Sessions/SearchContext/SearchContext'
import QueryBuilder, {
	BOOLEAN_OPERATORS,
	CUSTOM_TYPE,
	CustomField,
	deserializeGroup,
	FetchFieldVariables,
	propertiesToRules,
	QueryBuilderState,
	RANGE_OPERATORS,
	RuleProps,
	SelectOption,
	serializeRules,
	SESSION_TYPE,
	TIME_OPERATORS,
	VIEWED_BY_OPERATORS,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'

const TIME_RANGE_FIELD: SelectOption = {
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
		type: SESSION_TYPE,
		name: 'landing_page',
		options: {
			type: 'text',
		},
	},
	{
		type: SESSION_TYPE,
		name: 'exit_page',
		options: {
			type: 'text',
		},
	},
	{
		type: SESSION_TYPE,
		name: 'country',
		options: {
			type: 'text',
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
]

// If there is no query builder param (for segments saved
// before the query builder was released), create one.
export const getQueryFromParams = (params: SearchParams): QueryBuilderState => {
	const rules: RuleProps[] = []
	if (params.user_properties) {
		rules.push(...propertiesToRules(params.user_properties, 'user', 'is'))
	}
	if (params.excluded_properties) {
		rules.push(
			...propertiesToRules(params.excluded_properties, 'user', 'is_not'),
		)
	}
	if (params.track_properties) {
		rules.push(...propertiesToRules(params.track_properties, 'track', 'is'))
	}
	if (params.excluded_track_properties) {
		rules.push(
			...propertiesToRules(
				params.excluded_track_properties,
				'track',
				'is_not',
			),
		)
	}
	if (params.date_range) {
		const start = moment(params.date_range.start_date).toISOString()
		const end = moment(params.date_range.end_date).toISOString()
		rules.push(
			deserializeGroup('custom_created_at', 'between_date', [
				`${start}_${end}`,
			]),
		)
	}
	if (params.length_range) {
		const min = params.length_range.min
		const max = params.length_range.max
		rules.push(
			deserializeGroup('custom_active_length', 'between_time', [
				`${min}_${max}`,
			]),
		)
	}
	if (params.browser) {
		rules.push(
			deserializeGroup('session_browser_name', 'is', [params.browser]),
		)
	}
	if (params.os) {
		rules.push(deserializeGroup('session_os_name', 'is', [params.os]))
	}
	if (params.environments && params.environments.length > 0) {
		rules.push(
			deserializeGroup(
				'session_environment',
				'is',
				params.environments.map((env) => env ?? ''),
			),
		)
	}
	if (params.app_versions && params.app_versions.length > 0) {
		rules.push(
			deserializeGroup(
				'custom_app_version',
				'is',
				params.app_versions.map((ver) => ver ?? ''),
			),
		)
	}
	if (params.city) {
		rules.push(deserializeGroup('city', 'is', [params.city]))
	}
	if (params.device_id) {
		rules.push(
			deserializeGroup('session_device_id', 'is', [params.device_id]),
		)
	}
	if (params.visited_url) {
		rules.push(
			deserializeGroup('session_visited-url', 'contains', [
				params.visited_url,
			]),
		)
	}
	if (params.referrer) {
		rules.push(
			deserializeGroup('session_referrer', 'is', [params.referrer]),
		)
	}
	if (params.identified) {
		rules.push(deserializeGroup('user_identifier', 'exists', []))
	}
	if (params.hide_viewed) {
		rules.push(deserializeGroup('custom_viewed', 'is', ['false']))
	}
	if (params.first_time) {
		rules.push(deserializeGroup('custom_first_time', 'is', ['true']))
	}
	if (!params.show_live_sessions) {
		rules.push(deserializeGroup('custom_processed', 'is', ['true']))
	} else {
		rules.push(
			deserializeGroup('custom_processed', 'is', ['true', 'false']),
		)
	}
	return {
		isAnd: true,
		rules: serializeRules(rules),
	}
}

const SessionsQueryBuilder = React.memo(
	({ readonly }: { readonly?: boolean }) => {
		const { refetch } = useGetFieldsOpensearchQuery({
			skip: true,
		})
		const fetchFields = (variables: FetchFieldVariables) =>
			refetch(variables).then((r) => r.data.fields_opensearch)
		const { project_id } = useParams<{
			project_id: string
		}>()

		const { data: fieldData } = useGetFieldTypesQuery({
			variables: { project_id },
		})

		return (
			<QueryBuilder
				searchContext={useSearchContext()}
				timeRangeField={TIME_RANGE_FIELD}
				customFields={CUSTOM_FIELDS}
				fetchFields={fetchFields}
				fieldData={fieldData}
				getQueryFromParams={getQueryFromParams}
				readonly={readonly}
			/>
		)
	},
)
export default SessionsQueryBuilder
