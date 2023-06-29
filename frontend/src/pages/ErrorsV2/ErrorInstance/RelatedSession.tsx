import { IconSolidPlayCircle, Tag, Tooltip } from '@highlight-run/ui'
import { createSearchParams, useNavigate } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

const getSessionLink = (data: GetErrorInstanceQuery | undefined): string => {
	const errorObject = data?.error_instance?.error_object

	if (!errorObject) {
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

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const RelatedSession = ({ data }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const navigate = useNavigate()
	const sessionLink = getSessionLink(data)

	const tag = (
		<Tag
			kind="secondary"
			emphasis="low"
			size="medium"
			shape="basic"
			onClick={() => navigate(sessionLink)}
			disabled={!isLoggedIn || sessionLink === ''}
			iconLeft={<IconSolidPlayCircle />}
		>
			Related session
		</Tag>
	)

	if (data?.error_instance?.error_object.session?.processed === false) {
		return <WithDevToolsTooltip>{tag}</WithDevToolsTooltip>
	} else {
		return tag
	}
}
