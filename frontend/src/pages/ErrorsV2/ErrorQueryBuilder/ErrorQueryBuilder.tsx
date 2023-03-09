import { useGetErrorFieldsOpensearchQuery } from '@graph/hooks'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import QueryBuilder, {
	CustomField,
	FetchFieldVariables,
	SelectOption,
} from '@pages/ErrorsV2/ErrorQueryBuilder/components/QueryBuilder/QueryBuilder'

export const CUSTOM_TYPE = 'custom'
export const SESSION_TYPE = 'session'
export const ERROR_TYPE = 'error'
export const ERROR_FIELD_TYPE = 'error-field'
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
			{...props}
		/>
	)
}
export default ErrorQueryBuilder
