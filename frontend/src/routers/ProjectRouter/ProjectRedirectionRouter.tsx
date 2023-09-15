import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const ProjectRedirectionRouter = () => {
	const { loading, error, data } = useGetProjectsAndWorkspacesQuery({
		fetchPolicy: 'network-only',
	})
	const { admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const location = useLocation()

	useEffect(() => {
		if (loading) {
			setLoadingState(AppLoadingState.LOADING)
		}
		if (error) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState, error])

	if (error) {
		return <p>{'App error: ' + JSON.stringify(error)}</p>
	}

	if (loading || !admin) {
		return null
	}

	let redirectTo
	if (data?.projects?.length) {
		redirectTo = `/${data!.projects[0]!.id}${location.pathname}`
	} else {
		redirectTo = '/new'
	}

	// Redirects the user to their default project when the URL does not have an
	// project ID. For example, this allows linking to /sessions which will
	// redirect the user to /${firstProjectId}/sessions.
	return (
		<Navigate
			to={{ pathname: redirectTo, search: location.search }}
			replace
		/>
	)
}
