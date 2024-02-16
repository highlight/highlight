import { IconSolidSparkles, Tag } from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { useRelatedResources } from '@/components/RelatedResourcePanel/hooks'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { ReservedTraceKey } from '@/graph/generated/schemas'
import analytics from '@/util/analytics'

// TODO: Add call to useRelatedResources and push() on the trace
const getTraceLink = (data: GetErrorInstanceQuery | undefined): string => {
	const errorObject = data?.error_instance?.error_object

	if (!errorObject || !errorObject.trace_id) {
		return ''
	}

	const params = createSearchParams({
		query: `${ReservedTraceKey.TraceId}${DEFAULT_OPERATOR}${errorObject.trace_id}`,
		start_date: moment(errorObject.timestamp)
			.add(-5, 'minutes')
			.toISOString(),
		end_date: moment(errorObject.timestamp).add(5, 'minutes').toISOString(),
	})

	return `/${errorObject.project_id}/traces/${errorObject.trace_id}?${params}`
}

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedTrace = ({ data }: Props) => {
	const { push } = useRelatedResources()
	const { isLoggedIn } = useAuthContext()
	const traceId = data?.error_instance?.error_object?.trace_id

	return (
		<Tag
			kind="secondary"
			emphasis="high"
			size="medium"
			shape="basic"
			disabled={!isLoggedIn || !traceId}
			iconLeft={<IconSolidSparkles size={11} />}
			onClick={() => {
				analytics.track('error_related-trace-link_click')
				push('trace', traceId || '')
			}}
		>
			Related trace
		</Tag>
	)
}
