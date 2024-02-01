import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { matchRoutes, useMatch } from 'react-router-dom'

export function useProjectId() {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	return { projectId: projectIdRemapped! }
}

export function useNumericProjectId(location?: Location) {
	let project_id = useMatch('/:project_id/*')?.params.project_id
	if (location) {
		project_id = matchRoutes([{ path: '/:project_id/*' }], location)?.at(0)
			?.params.project_id
	}
	const projectId =
		project_id === DEMO_WORKSPACE_PROXY_APPLICATION_ID
			? DEMO_PROJECT_ID
			: project_id

	return { projectId }
}

export function useLocalStorageProjectId() {
	const { projectId } = useProjectId()
	const [localStorageProjectId, setProjectId] = useLocalStorage(
		'highlight-project-id',
		projectId,
	)

	return { projectId: localStorageProjectId, setProjectId }
}
