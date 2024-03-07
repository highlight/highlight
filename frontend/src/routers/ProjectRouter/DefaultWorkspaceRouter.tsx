import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspacesQuery } from '@graph/hooks'
import { useEffect } from 'react'
import { Navigate, useMatch } from 'react-router-dom'

export const DefaultWorkspaceRouter = () => {
	const { isLoggedIn } = useAuthContext()

	const workspaceMatch = useMatch('/w/:page_id')
	const pageId = workspaceMatch?.params.page_id ?? ''
	const { setLoadingState } = useAppLoadingContext()

	const { data, loading } = useGetWorkspacesQuery({
		skip: !isLoggedIn,
	})

	useEffect(() => {
		if (isLoggedIn) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [isLoggedIn, setLoadingState])

	if (loading || !data?.workspaces?.length) {
		return null
	}

	if (!isLoggedIn) {
		return null
	}

	const firstWorkspace = data.workspaces[0]
	if (firstWorkspace?.id.length) {
		return <Navigate to={`/w/${firstWorkspace.id}/${pageId}`} replace />
	}

	return <Navigate to="/" />
}
