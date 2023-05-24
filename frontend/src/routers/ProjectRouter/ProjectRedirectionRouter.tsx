import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthContext } from '@/routers/AuthenticationRolerouter/context/AuthContext'

export const ProjectRedirectionRouter = () => {
	const { loading, error, data } = useGetProjectsAndWorkspacesQuery()
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

	if (!admin?.about_you_details_filled) {
		return <Navigate to="/about-you" replace />
	}

	let redirectTo
	if (data?.projects?.length) {
		redirectTo = `/${data!.projects[0]!.id}${location.pathname}`
	} else if (!admin?.about_you_details_filled) {
		redirectTo = '/about_you'
	} else {
		debugger
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
