import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const ProjectRedirectionRouter = () => {
	const { allProjects: projects, loading } = useApplicationContext()
	const { admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const location = useLocation()

	useEffect(() => {
		if (loading) {
			setLoadingState(AppLoadingState.LOADING)
		} else {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState])

	if (loading || !admin) {
		return null
	}

	let redirectTo
	if (projects?.length) {
		redirectTo = `/${projects[0]!.id}${location.pathname}`
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
