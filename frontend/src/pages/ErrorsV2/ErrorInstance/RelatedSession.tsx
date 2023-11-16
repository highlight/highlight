import { Box, IconSolidPlayCircle, Tag, Tooltip } from '@highlight-run/ui'
import { useSearchParams } from 'react-router-dom'

import { useAuthContext } from '@/authentication/AuthContext'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

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
	const [_, setSearchParams] = useSearchParams()
	const sessionSecureID =
		data?.error_instance?.error_object.session?.secure_id
	const timestamp = data?.error_instance?.error_object.timestamp

	const viewSession = () => {
		setSearchParams((params) => {
			if (sessionSecureID) {
				params.set('panel', 'session')
				params.set('session_secure_id', sessionSecureID)

				if (timestamp) {
					params.set(PlayerSearchParameters.tsAbs, timestamp)
				}
			}
			return params
		})
	}

	const tag = (
		<Box>
			<Tag
				kind="secondary"
				emphasis="high"
				size="small"
				shape="basic"
				disabled={!isLoggedIn || !sessionSecureID}
				onClick={viewSession}
				iconLeft={<IconSolidPlayCircle />}
			>
				Related session
			</Tag>
		</Box>
	)

	if (!sessionSecureID) {
		return <NoSessionTooltip>{tag}</NoSessionTooltip>
	} else if (
		data?.error_instance?.error_object.session?.processed === false
	) {
		return <WithDevToolsTooltip>{tag}</WithDevToolsTooltip>
	} else {
		return tag
	}
}
