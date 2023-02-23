import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

export const ProjectRedirectionRouter = () => {
	const { loading, error, data } = useGetProjectsAndWorkspacesQuery()
	const { admin } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const location = useLocation()
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam

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
	} else if (data?.workspaces?.length) {
		redirectTo = `/w/${data!.workspaces[0]!.id}/new`
	} else if (admin.email_verified === false) {
		redirectTo = '/verify_email'
	} else if (!admin.about_you_details_filled && !isVercelIntegrationFlow) {
		redirectTo = '/about_you'
	} else {
		redirectTo = '/new'
	}

	// Redirects the user to their default project when the URL does not have an project ID.
	// For example, this allows linking to https://app.highlight.run/sessions for https://app.highlight.run/1/sessions
	return (
		<Navigate
			to={{ pathname: redirectTo, search: location.search }}
			replace
		/>
	)
}
