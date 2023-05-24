import { ApolloError } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { ErrorState } from '@/components/ErrorState/ErrorState'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@/context/AppLoadingContext'
import {
	useGetAdminLazyQuery,
	useGetAdminRoleByProjectLazyQuery,
	useGetAdminRoleLazyQuery,
	useGetProjectLazyQuery,
} from '@/graph/generated/hooks'
import { Admin } from '@/graph/generated/schemas'
import { AppRouter } from '@/routers/AppRouter/AppRouter'
import {
	AuthContextProvider,
	AuthRole,
	isAuthLoading,
	isHighlightAdmin,
	isLoggedIn,
} from '@/routers/AuthenticationRolerouter/context/AuthContext'
import analytics from '@/util/analytics'
import { auth } from '@/util/auth'
import { HIGHLIGHT_ADMIN_EMAIL_DOMAINS } from '@/util/authorization/authorizationUtils'
import { client } from '@/util/graph'

export const AuthenticationRoleRouter = () => {
	const location = useLocation()
	const workspaceId = /^\/w\/(\d+)\/.*$/.exec(location.pathname)?.pop()
	const projectId = /^\/(\d+)\/.*$/.exec(location.pathname)?.pop()
	const user = auth.currentUser

	const [
		getAdminWorkspaceRoleQuery,
		{
			error: adminWError,
			data: adminWData,
			called: wCalled,
			refetch: wRefetch,
		},
	] = useGetAdminRoleLazyQuery()

	const [
		getAdminProjectRoleQuery,
		{
			error: adminPError,
			data: adminPData,
			called: pCalled,
			refetch: pRefetch,
		},
	] = useGetAdminRoleByProjectLazyQuery()

	const [
		getAdminSimpleQuery,
		{
			error: adminSError,
			data: adminSData,
			called: sCalled,
			refetch: sRefetch,
		},
	] = useGetAdminLazyQuery()

	// TODO: Understand why we have the different get admin queries.
	let getAdminQuery:
			| typeof getAdminWorkspaceRoleQuery
			| typeof getAdminProjectRoleQuery
			| typeof getAdminSimpleQuery,
		adminError: ApolloError | undefined,
		adminData: Admin | undefined | null,
		adminRole: string | undefined,
		called: boolean,
		refetch: typeof wRefetch | typeof pRefetch | typeof sRefetch
	if (workspaceId) {
		getAdminQuery = getAdminWorkspaceRoleQuery
		adminError = adminWError
		adminData = adminWData?.admin_role?.admin
		adminRole = adminWData?.admin_role?.role
		called = wCalled
		refetch = wRefetch
	} else if (projectId) {
		getAdminQuery = getAdminProjectRoleQuery
		adminError = adminPError
		adminData = adminPData?.admin_role_by_project?.admin
		adminRole = adminPData?.admin_role_by_project?.role
		called = pCalled
		refetch = pRefetch
	} else {
		getAdminQuery = getAdminSimpleQuery
		adminError = adminSError
		adminData = adminSData?.admin
		called = sCalled
		refetch = sRefetch
	}

	const { setLoadingState } = useAppLoadingContext()
	const [getProjectQuery] = useGetProjectLazyQuery()
	const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING)

	useEffect(() => {
		// Wait until auth is finished loading otherwise this request can fail.
		if (!adminData || !projectId || isAuthLoading(authRole)) {
			return
		}

		getProjectQuery({
			variables: {
				id: projectId,
			},
			onCompleted: (data) => {
				if (!data.project || !adminData) {
					return
				}

				analytics.identify(adminData.id, {
					'Project ID': data.project?.id,
					'Workspace ID': data.workspace?.id,
				})
			},
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [adminData, authRole, projectId])

	const fetchAdmin = useCallback(async () => {
		const variables: any = {}
		if (workspaceId) {
			variables.workspace_id = workspaceId
		} else if (projectId) {
			variables.project_id = projectId
		}

		const query = called
			? await refetch(variables)
			: await getAdminQuery({ variables })

		if (query.data) {
			if (
				HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) =>
					adminData?.email.includes(d),
				)
			) {
				setAuthRole(AuthRole.AUTHENTICATED_HIGHLIGHT)
			} else {
				setAuthRole(AuthRole.AUTHENTICATED)
			}
		} else {
			setAuthRole(AuthRole.UNAUTHENTICATED)
		}
	}, [
		adminData?.email,
		called,
		getAdminQuery,
		projectId,
		refetch,
		workspaceId,
	])

	// TODO: Think about how we want to trigger an admin refetch when the user
	// changes contexts.
	useEffect(() => {
		fetchAdmin()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getAdminQuery])

	useEffect(() => {
		if (authRole === AuthRole.UNAUTHENTICATED) {
			setLoadingState(
				isAuthLoading(authRole)
					? AppLoadingState.LOADING
					: AppLoadingState.LOADED,
			)
		}
	}, [authRole, setLoadingState])

	const [enableStaffView] = useLocalStorage(
		`highlight-enable-staff-view`,
		true,
	)

	const loggedIn = isLoggedIn(authRole)
	console.log('::: loggedIn', loggedIn, adminData)

	return (
		<AuthContextProvider
			value={{
				role: authRole,
				admin: loggedIn ? adminData ?? undefined : undefined,
				workspaceRole: adminRole || undefined,
				isAuthLoading: isAuthLoading(authRole),
				isLoggedIn: loggedIn,
				isHighlightAdmin:
					isHighlightAdmin(authRole) && !!enableStaffView,
				user,
				signIn: () => {
					debugger
					fetchAdmin()
					analytics.track('Authenticated')
				},
				signOut: async () => {
					await auth.signOut()
					await fetchAdmin()
					client.clearStore()
				},
				refetchAdmin: refetch,
			}}
		>
			<Helmet>
				<title>highlight.io</title>
			</Helmet>
			{adminError ? (
				<ErrorState
					message={
						`Seems like we had an issue with your login 😢. ` +
						`Feel free to log out and try again, or otherwise, ` +
						`get in contact with us!`
					}
					errorString={JSON.stringify(adminError)}
				/>
			) : (
				<Routes>
					<Route path="/*" element={<AppRouter />} />
				</Routes>
			)}
		</AuthContextProvider>
	)
}
