import { IconSolidPlayCircle, Tag, Tooltip } from '@highlight-run/ui/components'

import { useAuthContext } from '@/authentication/AuthContext'
import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import analytics from '@/util/analytics'

const WithDevToolsTooltip = ({ children }: React.PropsWithChildren) => {
	return (
		<Tooltip trigger={children}>
			This session is still live -- some Dev tools may not work as
			expected.
		</Tooltip>
	)
}

const NoSessionTooltip = ({ children }: React.PropsWithChildren) => {
	return (
		<Tooltip trigger={children}>No session found for this error.</Tooltip>
	)
}

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedSession = ({ data }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { set } = useRelatedResource()
	const errorObject = data?.error_instance?.error_object
	const session = errorObject?.session

	const tag = (
		<Tag
			onClick={() => {
				if (!session) {
					return
				}

				set({
					type: 'session',
					secureId: session.secure_id,
					tsAbs: errorObject.timestamp,
					errorId: errorObject.id,
				})

				analytics.track('error_related-session-link_click')
			}}
			kind="secondary"
			emphasis="high"
			size="medium"
			shape="basic"
			disabled={!isLoggedIn || !session}
			iconLeft={<IconSolidPlayCircle size={11} />}
		>
			Related session
		</Tag>
	)

	if (!session) {
		return <NoSessionTooltip>{tag}</NoSessionTooltip>
	} else if (session.processed === false) {
		return <WithDevToolsTooltip>{tag}</WithDevToolsTooltip>
	} else {
		return tag
	}
}
