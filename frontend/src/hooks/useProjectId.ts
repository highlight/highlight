import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { matchRoutes, useMatch } from 'react-router-dom'

export function useProjectId() {
	const { project_id } = useParams<{
		project_id: string
	}>()
	return { projectId: project_id! }
}

export function useNumericProjectId(location?: Location) {
	let project_id = useMatch('/:project_id/*')?.params.project_id
	if (location) {
		project_id = matchRoutes([{ path: '/:project_id/*' }], location)?.at(0)
			?.params.project_id
	}
	return { projectId: project_id }
}

export function useLocalStorageProjectId() {
	const { projectId } = useProjectId()
	const [localStorageProjectId, setProjectId] = useLocalStorage(
		'highlight-project-id',
		projectId,
	)

	return { projectId: localStorageProjectId, setProjectId }
}
