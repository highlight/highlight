import { IconSolidPlayCircle, Tag, Tooltip } from '@highlight-run/ui/components'
import { createSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'
import analytics from '@/util/analytics'

const getSessionLink = (data: GetErrorInstanceQuery | undefined): string => {
	const errorObject = data?.error_instance?.error_object

	if (!errorObject?.session) {
		return ''
	}

	const params = createSearchParams({
		tsAbs: errorObject.timestamp,
		[PlayerSearchParameters.errorId]: errorObject.id,
	})
	return `/${errorObject.project_id}/sessions/${errorObject.session?.secure_id}?${params}`
}

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
	const sessionLink = getSessionLink(data)

	const tag = (
		<Link
			to={sessionLink}
			onClick={() => analytics.track('error_related-session-link_click')}
		>
			<Tag
				kind="secondary"
				emphasis="high"
				size="medium"
				shape="basic"
				disabled={!isLoggedIn || sessionLink === ''}
				iconLeft={<IconSolidPlayCircle />}
			>
				Related session
			</Tag>
		</Link>
	)

	if (sessionLink === '') {
		return <NoSessionTooltip>{tag}</NoSessionTooltip>
	} else if (
		data?.error_instance?.error_object.session?.processed === false
	) {
		return <WithDevToolsTooltip>{tag}</WithDevToolsTooltip>
	} else {
		return tag
	}
}
