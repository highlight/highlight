import { IconSolidSparkles, Tag } from '@highlight-run/ui/components'

import { useAuthContext } from '@/authentication/AuthContext'
import { useRelatedResource } from '@/components/RelatedResourcePanel/hooks'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import analytics from '@/util/analytics'

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedTrace = ({ data }: Props) => {
	const { set } = useRelatedResource()
	const { isLoggedIn } = useAuthContext()
	const traceId = data?.error_instance?.error_object?.trace_id

	return (
		<Tag
			kind="secondary"
			emphasis="high"
			size="small"
			shape="basic"
			disabled={!isLoggedIn || !traceId}
			iconLeft={<IconSolidSparkles size={11} />}
			onClick={() => {
				analytics.track('error_related-trace-link_click')
				set('trace', traceId || '')
			}}
		>
			Related trace
		</Tag>
	)
}
