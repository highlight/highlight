import { IconSolidArrowSmLeft, Tag } from '@highlight-run/ui/components'

import { useAuthContext } from '@/authentication/AuthContext'
import { Link } from '@/components/Link'
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
		<Link to={`/${projectId}/errors/${errorGroupSecureID}/instances`}>
			<Tag
				kind="secondary"
				emphasis="medium"
				size="medium"
				shape="basic"
				iconLeft={<IconSolidArrowSmLeft />}
				disabled={!isLoggedIn || !errorGroupSecureID}
			>
				See all instances
			</Tag>
		</Link>
	)
}
