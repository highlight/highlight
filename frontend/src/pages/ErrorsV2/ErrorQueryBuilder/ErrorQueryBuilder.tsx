import {
	useEditErrorSegmentMutation,
	useGetErrorFieldsOpensearchQuery,
	useGetErrorSegmentsQuery,
} from '@graph/hooks'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import useErrorPageConfiguration from '@pages/ErrorsV2/utils/ErrorPageUIConfiguration'

import QueryBuilder, {
	CustomField,
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	FetchFieldVariables,
	SelectOption,
} from '@/components/QueryBuilder/QueryBuilder'
import CreateErrorSegmentModal from '@/pages/Errors/ErrorSegmentSidebar/SegmentButtons/CreateErrorSegmentModal'
import DeleteErrorSegmentModal from '@/pages/Errors/ErrorSegmentSidebar/SegmentPicker/DeleteErrorSegmentModal/DeleteErrorSegmentModal'
import { EmptyErrorsSearchParams } from '@/pages/Errors/ErrorsPage'

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
	const { setShowLeftPanel } = useErrorPageConfiguration()

	return (
		<QueryBuilder
			searchContext={useErrorSearchContext()}
			timeRangeField={TIME_RANGE_FIELD}
			customFields={CUSTOM_FIELDS}
			fetchFields={fetchFields}
			emptySearchParams={EmptyErrorsSearchParams}
			useEditAnySegmentMutation={useEditErrorSegmentMutation}
			useGetAnySegmentsQuery={useGetErrorSegmentsQuery}
			setShowLeftPanel={setShowLeftPanel}
			CreateAnySegmentModal={CreateErrorSegmentModal}
			DeleteAnySegmentModal={DeleteErrorSegmentModal}
			{...props}
		/>
	)
}
export default ErrorQueryBuilder
