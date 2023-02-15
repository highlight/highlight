import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { useParams } from '@util/react-router/useParams'
import { useMatch } from 'react-router-dom'

export function useProjectId() {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	return { projectId: projectIdRemapped }
}

export function useNumericProjectId() {
	const projectMatch = useMatch('/:project_id/*')
	const projectId =
		projectMatch?.params.project_id === DEMO_WORKSPACE_PROXY_APPLICATION_ID
			? DEMO_WORKSPACE_APPLICATION_ID
			: projectMatch?.params.project_id

	return { projectId }
}
