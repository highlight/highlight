import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { useParams } from '@/util/react-router/useParams'

export const useSessionParams = () => {
	const { resource } = useRelatedResource()
	const { projectId } = useNumericProjectId()
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const sessionSecureId =
		resource?.type === 'session' ? resource.secureId : session_secure_id

	return {
		projectId,
		sessionSecureId,
		inPanel: resource?.type === 'session',
	}
}
