import {
	useGetErrorFieldsClickhouseQuery,
	useGetErrorTagsQuery,
} from '@graph/hooks'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useCallback } from 'react'

import QueryBuilder, {
	CustomField,
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	FetchFieldVariables,
	QueryBuilderProps,
} from '@/components/QueryBuilder/QueryBuilder'

export const CUSTOM_FIELDS: CustomField[] = [
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
		type: ERROR_TYPE,
		name: 'Tag',
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
	{
		type: ERROR_FIELD_TYPE,
		name: 'service_name',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'service_version',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'has_session',
		options: {
			operators: ['is', 'is_not'],
			type: 'boolean',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'secure_session_id',
		options: {
			type: 'text',
		},
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'trace_id',
		options: {
			type: 'text',
		},
	},
]

const ErrorQueryBuilder = (props: Partial<QueryBuilderProps>) => {
	const { data } = useGetErrorTagsQuery()
	const { refetch } = useGetErrorFieldsClickhouseQuery({
		skip: true,
		fetchPolicy: 'cache-and-network',
	})
	const fetchFields = useCallback(
		(variables: FetchFieldVariables) =>
			refetch(variables).then((r) => r.data.error_fields_clickhouse),
		[refetch],
	)

	return (
		<QueryBuilder
			searchContext={useErrorSearchContext()}
			customFields={props.customFields ?? CUSTOM_FIELDS}
			fetchFields={props.fetchFields ?? fetchFields}
			errorTagData={props.errorTagData ?? data}
			{...props}
		/>
	)
}
export default ErrorQueryBuilder
