import { IconSolidArrowSmLeft } from '@highlight-run/ui'

import { useAuthContext } from '@/authentication/AuthContext'
import { LinkButton } from '@/components/LinkButton'
import { GetErrorInstanceQuery } from '@/graph/generated/operations'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	data: GetErrorInstanceQuery | undefined
}

export const SeeAllInstances = ({ data }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useProjectId()
	const errorGroupSecureID =
		data?.error_instance?.error_object.error_group_secure_id

	return (
		<LinkButton
			kind="secondary"
			size="xSmall"
			emphasis="medium"
			trackingId="seeAllInstance"
			iconLeft={<IconSolidArrowSmLeft />}
			disabled={!isLoggedIn || !errorGroupSecureID}
			to={`/${projectId}/errors/${errorGroupSecureID}/instances`}
		>
			See all instances
		</LinkButton>
	)
}
