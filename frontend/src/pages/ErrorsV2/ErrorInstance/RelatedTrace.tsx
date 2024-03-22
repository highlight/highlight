import { IconSolidSparkles, Tag } from '@highlight-run/ui/components'
import React from 'react'

import { useAuthContext } from '@/authentication/AuthContext'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import analytics from '@/util/analytics'

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedTrace: React.FC<Props> = ({ data }) => {
	const { isLoggedIn } = useAuthContext()
	const { set } = useRelatedResource()
	const traceId = data?.error_instance?.error_object?.trace_id

	return (
		<Tag
			onClick={() => {
				if (!traceId) {
					return
				}

				set({
					id: traceId,
					type: 'trace',
				})

				analytics.track('error_related-trace-link_click')
			}}
			kind="secondary"
			emphasis="high"
			size="medium"
			shape="basic"
			disabled={!isLoggedIn || !traceId}
			iconLeft={<IconSolidSparkles size={11} />}
		>
			Related trace
		</Tag>
	)
}
