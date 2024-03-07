import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const removeWorkspaceId = (pathname: string) => {
	// Remove the 'w' token and workspace id from the pathname
	const parts = pathname.split('/')
	parts.splice(1, 2)
	return parts.join('/')
}

// Redirects to the first project that the current admin has access to in the workspace
export const WorkspaceRedirectionRouter = () => {
	const { workspace_id } = useParams<{
		workspace_id: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	const {
		loading: o_loading,
		error: o_error,
		data: o_data,
	} = useGetProjectsQuery()

	const location = useLocation()

	useEffect(() => {
		setLoadingState(
			o_loading ? AppLoadingState.LOADING : AppLoadingState.LOADED,
		)
	}, [o_loading, setLoadingState])

	if (o_error) {
		return <p>{'App error: ' + JSON.stringify(o_error)}</p>
	}

	if (o_loading) {
		return null
	}

	const firstProjectIdInWorkspace = o_data!.projects?.filter(
		(p) => p?.workspace_id === workspace_id,
	)[0]?.id

	return (
		<Navigate
			to={
				firstProjectIdInWorkspace
					? `/${firstProjectIdInWorkspace}${removeWorkspaceId(
							location.pathname,
					  )}`
					: `/w/${workspace_id}/new`
			}
			replace
		/>
	)
}
