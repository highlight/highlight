import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { authRedirect } from '@/pages/Auth/utils'

export const ProjectRedirectionRouter = () => {
	const { loading, error, data } = useGetProjectsAndWorkspacesQuery({
		fetchPolicy: 'network-only',
	})
	const { admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const location = useLocation()
	const authRedirectRoute = authRedirect.get()

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
	if (authRedirectRoute && authRedirectRoute !== '/') {
		redirectTo = authRedirectRoute
	} else if (data?.projects?.length) {
		redirectTo = `/${data!.projects[0]!.id}${location.pathname}`
	} else {
		redirectTo = '/new'
	}

	// Redirects the user to their default project when the URL does not have an
	// project ID. For example, this allows linking to /sessions which will
	// redirect the user to /${firstProjectId}/sessions.
	return (
		<Navigate
			to={
				redirectTo.indexOf('?') > -1
					? redirectTo
					: { pathname: redirectTo, search: location.search }
			}
			replace
		/>
	)
}
