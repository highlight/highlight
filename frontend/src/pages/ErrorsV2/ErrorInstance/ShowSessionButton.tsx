import { Box, IconSolidPlay, Tooltip } from '@highlight-run/ui'
import { createSearchParams } from 'react-router-dom'

import { isLoggedIn } from '@/authentication/AuthContext'
import { Button } from '@/components/Button'
import { LinkButton } from '@/components/LinkButton'
import { ErrorObjectFragment } from '@/graph/generated/operations'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'

const getSessionLink = (errorObject: ErrorObjectFragment): string => {
	const params = createSearchParams({
		tsAbs: errorObject.timestamp,
		[PlayerSearchParameters.errorId]: errorObject.id,
	})
	return `/${errorObject.project_id}/sessions/${errorObject.session?.secure_id}?${params}`
}

const WithTooltip = ({ children }: React.PropsWithChildren) => {
	return (
		<Tooltip trigger={children}>
			Heads up! This session is still live and some Dev tools may not work
			as expected.
		</Tooltip>
	)
}

type Props = {
	errorObject?: ErrorObjectFragment
}

export const ShowSessionButton = ({ errorObject }: Props) => {
	const trackingId = 'errorInstanceShowSession'
	if (errorObject) {
		const linkButton = (
			<LinkButton
				kind="primary"
				emphasis="high"
				to={getSessionLink(errorObject)}
				disabled={!isLoggedIn || !errorObject.session}
				trackingId={trackingId}
			>
				<Box
					display="flex"
					alignItems="center"
					flexDirection="row"
					gap="4"
				>
					<IconSolidPlay />
					Show session
				</Box>
			</LinkButton>
		)

		if (errorObject.session?.processed === false) {
			return <WithTooltip>{linkButton}</WithTooltip>
		} else {
			return linkButton
		}
	} else {
		return (
			<Button
				kind="primary"
				emphasis="high"
				disabled={true}
				iconLeft={<IconSolidPlay />}
				trackingId={trackingId}
			>
				Show session
			</Button>
		)
	}
}
