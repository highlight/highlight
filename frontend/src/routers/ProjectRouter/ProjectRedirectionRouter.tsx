import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

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

	let redirectTo
	if (data?.projects?.length) {
		const authRoutes = [
			'sign_in',
			'sign_up',
			'reset_password',
			'about_you',
			'multi_factor',
		]
		let path = location.pathname.split('/')[1]
		console.log('::: path', path, location.pathname)
		// TODO: Handle other routes like sign_in
		if (authRoutes.indexOf(path) > -1) {
			path = '/sessions'
		}

		redirectTo = `/${data!.projects[0]!.id}${path}`
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
