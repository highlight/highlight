import { useGetErrorFieldsOpensearchQuery } from '@graph/hooks'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import QueryBuilder, {
	CustomField,
	deserializeGroup,
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	FetchFieldVariables,
	QueryBuilderState,
	RuleProps,
	SelectOption,
	serializeRules,
} from '@pages/ErrorsV2/ErrorQueryBuilder/components/QueryBuilder/QueryBuilder'
import moment from 'moment'

export const TIME_RANGE_FIELD: SelectOption = {
	kind: 'single',
	label: 'timestamp',
	value: 'error-field_timestamp',
}

const CUSTOM_FIELDS: CustomField[] = [
	{
		type: ERROR_TYPE,
		name: 'Type',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_TYPE,
		name: 'Event',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_TYPE,
		name: 'state',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'browser',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'os_name',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'visited_url',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'environment',
		options: {
			type: 'text',
		},
	},
]

// If there is no query builder param (for segments saved
// before the query builder was released), create one.
export const getQueryFromParams = (
	params: ErrorSearchParamsInput,
): QueryBuilderState => {
	const rules: RuleProps[] = []
	if (params.date_range) {
		const start = moment(params.date_range.start_date).toISOString()
		const end = moment(params.date_range.end_date).toISOString()
		rules.push(
			deserializeGroup('error-field_timestamp', 'between_date', [
				`${start}_${end}`,
			]),
		)
	}
	if (params.event) {
		rules.push(deserializeGroup('error_Event', 'is', [params.event]))
	}
	if (params.os) {
		rules.push(deserializeGroup('error-field_os_name', 'is', [params.os]))
	}
	if (params.state) {
		rules.push(deserializeGroup('error_state', 'is', [params.state]))
	} else {
		rules.push(deserializeGroup('error_state', 'is', ['OPEN']))
	}
	if (params.type) {
		rules.push(deserializeGroup('error_Type', 'is', [params.type]))
	}
	if (params.visited_url) {
		rules.push(
			deserializeGroup('error-field_visited_url', 'is', [
				params.visited_url,
			]),
		)
	}
	return {
		isAnd: true,
		rules: serializeRules(rules),
	}
}

const ErrorQueryBuilder = (props: { readonly?: boolean }) => {
	const { refetch } = useGetErrorFieldsOpensearchQuery({
		skip: true,
	})
	const fetchFields = (variables: FetchFieldVariables) =>
		refetch(variables).then((r) => r.data.error_fields_opensearch)

	return (
		<QueryBuilder
			searchContext={useErrorSearchContext()}
			timeRangeField={TIME_RANGE_FIELD}
			customFields={CUSTOM_FIELDS}
			fetchFields={fetchFields}
			getQueryFromParams={getQueryFromParams}
			{...props}
		/>
	)
}
export default ErrorQueryBuilder
