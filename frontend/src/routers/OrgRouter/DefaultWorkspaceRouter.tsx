import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetWorkspacesQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export const DefaultWorkspaceRouter = () => {
	const { isLoggedIn } = useAuthContext()

	const { page_id } = useParams<{
		page_id: string
	}>()
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
		return <Navigate to={`/w/${firstWorkspace.id}/${page_id}`} replace />
	}
	return <Navigate to="/" />
}
