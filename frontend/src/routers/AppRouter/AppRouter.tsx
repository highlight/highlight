import '../../App.css'

import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui'
import { useNumericProjectId } from '@hooks/useProjectId'
import { AccountsPage } from '@pages/Accounts/Accounts'
import { AdminForm } from '@pages/Auth/AdminForm'
import {
	AuthRouter,
	SIGN_IN_ROUTE,
	SIGN_UP_ROUTE,
} from '@pages/Auth/AuthRouter'
import { InviteTeamForm } from '@pages/Auth/InviteTeam'
import { VerifyEmail } from '@pages/Auth/VerifyEmail'
import { EmailOptOutPage } from '@pages/EmailOptOut/EmailOptOut'
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import { Landing } from '@pages/Landing/Landing'
import NewProjectPage from '@pages/NewProject/NewProjectPage'
import OAuthApprovalPage from '@pages/OAuthApproval/OAuthApprovalPage'
import SwitchProject from '@pages/SwitchProject/SwitchProject'
import SwitchWorkspace from '@pages/SwitchWorkspace/SwitchWorkspace'
import useLocalStorage from '@rehooks/local-storage'
import { ApplicationContextProvider } from '@routers/AppRouter/context/ApplicationContext'
import InternalRouter from '@routers/InternalRouter/InternalRouter'
import { DefaultWorkspaceRouter } from '@routers/ProjectRouter/DefaultWorkspaceRouter'
import { ProjectRedirectionRouter } from '@routers/ProjectRouter/ProjectRedirectionRouter'
import { ProjectRouter } from '@routers/ProjectRouter/ProjectRouter'
import { WorkspaceRouter } from '@routers/ProjectRouter/WorkspaceRouter'
import analytics from '@util/analytics'
import { loadIntercom } from '@util/window'
import { omit } from 'lodash'
import { useEffect, useState } from 'react'
import {
	Navigate,
	Route,
	Routes,
	useMatch,
	useNavigate,
} from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	useGetProjectDropdownOptionsQuery,
	useGetWorkspaceDropdownOptionsQuery,
} from '@/graph/generated/hooks'
import {
	GetProjectDropdownOptionsQuery,
	GetWorkspaceDropdownOptionsQuery,
} from '@/graph/generated/operations'
import { JoinWorkspace } from '@/pages/Auth/JoinWorkspace'
import { WorkspaceInvitation } from '@/pages/Auth/WorkspaceInvitation'
import {
	ErrorTags,
	ErrorTagsAdmin,
	ErrorTagsContainer,
	ErrorTagsSearch,
} from '@/pages/ErrorTags'
import WithErrorSearchContext from '@/routers/ProjectRouter/WithErrorSearchContext'
import WithSessionSearchContext from '@/routers/ProjectRouter/WithSessionSearchContext'

export const VERIFY_EMAIL_ROUTE = '/verify_email'
export const ABOUT_YOU_ROUTE = '/about_you'
export const INVITE_TEAM_ROUTE = '/invite_team'
export const SETUP_ROUTE = '/setup'

export const AppRouter = () => {
	const { admin, isLoggedIn, isAuthLoading, isHighlightAdmin } =
		useAuthContext()
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const newProjectMatch = useMatch('/new')
	const newWorkspaceMatch = useMatch('/w/:workspace_id/new')
	const workspaceId = workspaceMatch?.params.workspace_id
	const workspaceInviteMatch = useMatch('/w/:workspace_id/invite/:invite')
	const inviteMatch = useMatch('/invite/:invite')
	const joinWorkspaceMatch = useMatch('/join_workspace')
	const isInvitePage = !!inviteMatch
	const isNewProjectPage = !!newWorkspaceMatch
	const isNewWorkspacePage = !!newProjectMatch
	const isJoinWorkspacePage = !!joinWorkspaceMatch
	const [inviteCode, setInviteCode] = useLocalStorage('highlightInviteCode')
	const { projectId } = useNumericProjectId()
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const navigate = useNavigate()
	const [workspaceListData, setWorkspaceListData] =
		useState<GetWorkspaceDropdownOptionsQuery>()
	const [projectListData, setProjectListData] =
		useState<GetProjectDropdownOptionsQuery>()
	const isValidProjectId = Number.isInteger(Number(projectId))

	const { data: projectDropdownData, loading: projectDropdownDataLoading } =
		useGetProjectDropdownOptionsQuery({
			variables: { project_id: projectId! },
			skip: !isLoggedIn || !isValidProjectId,
		})

	const {
		data: workspaceDropdownData,
		loading: workspaceDropdownDataLoading,
	} = useGetWorkspaceDropdownOptionsQuery({
		variables: { workspace_id: workspaceId ?? '' },
		skip: !isLoggedIn || !workspaceId,
	})

	useEffect(() => {
		if (projectDropdownData) {
			setProjectListData(projectDropdownData)
		} else if (workspaceDropdownData) {
			setWorkspaceListData(workspaceDropdownData)
			setProjectListData(undefined)
		}
	}, [workspaceDropdownData, projectDropdownData])

	useEffect(() => {
		if (workspaceInviteMatch?.params.invite) {
			setInviteCode(workspaceInviteMatch.params.invite)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (admin && admin.email_verified === false) {
			navigate(VERIFY_EMAIL_ROUTE, { replace: true })
			return
		}

		if (admin && inviteCode && inviteCode !== 'ignored' && !isInvitePage) {
			navigate(`/invite/${inviteCode}`, { replace: true })
			return
		}

		if (
			admin &&
			!admin.about_you_details_filled &&
			!isVercelIntegrationFlow &&
			!isInvitePage &&
			!isJoinWorkspacePage
		) {
			navigate(ABOUT_YOU_ROUTE, { replace: true })
			return
		}

		// Redirects from `DEMO_PROJECT_ID/*` to `demo/*` so that we can keep the
		// demo URL schema consistent even if the project changes.
		const pathSegments = location.pathname.split('/').filter(Boolean)
		if (pathSegments[0] === DEMO_PROJECT_ID) {
			pathSegments[0] = DEMO_WORKSPACE_PROXY_APPLICATION_ID

			navigate(`/${pathSegments.join('/')}${location.search}`, {
				replace: true,
			})
			return
		}
	}, [
		admin,
		isVercelIntegrationFlow,
		navigate,
		inviteCode,
		isInvitePage,
		projectId,
		isJoinWorkspacePage,
	])

	useEffect(() => {
		if (admin) {
			const { email, id, name } = admin
			const identifyMetadata: {
				id: string
				name: string
				avatar?: string
				email?: string
			} = {
				id,
				name,
				email,
			}

			if (admin.photo_url) {
				identifyMetadata.avatar = admin.photo_url
			}

			// `id` is a reserved keyword in rudderstack and it's recommended to use a
			// static property for the user ID rather than something that could change
			// over time, like an email address.
			analytics.identify(admin.id, omit(identifyMetadata, ['id']))
			loadIntercom({ admin })
		}
	}, [admin])

	if (isAuthLoading) {
		return null
	}

	return (
		<Box height="screen" width="screen">
			<ApplicationContextProvider
				value={{
					loading:
						projectDropdownDataLoading ||
						workspaceDropdownDataLoading,
					currentProject: projectListData?.project ?? undefined,
					allProjects:
						(projectListData?.workspace?.projects ||
							workspaceListData?.workspace?.projects) ??
						[],
					currentWorkspace:
						(projectListData?.workspace ||
							workspaceListData?.workspace) ??
						undefined,
					workspaces:
						(projectListData?.workspaces ||
							workspaceListData?.workspaces) ??
						[],
				}}
			>
				<WithSessionSearchContext>
					<WithErrorSearchContext>
						{(isNewWorkspacePage || isNewProjectPage) &&
							(isLoggedIn ? (
								<NewProjectPage
									workspace_id={
										isNewProjectPage
											? workspaceId
											: undefined
									}
								/>
							) : (
								<Navigate to={SIGN_IN_ROUTE} />
							))}
						<Routes>
							<Route
								path="/new"
								element={
									<Landing>
										<SwitchWorkspace />
									</Landing>
								}
							/>
							<Route
								path="/error-tags"
								element={<ErrorTagsContainer />}
							>
								<Route index element={<ErrorTags />} />

								{isHighlightAdmin && (
									<Route
										path="/error-tags/admin"
										element={<ErrorTagsAdmin />}
									/>
								)}

								<Route
									path="/error-tags/search"
									element={<ErrorTagsSearch />}
								/>
							</Route>

							<Route
								path="/join_workspace"
								element={<JoinWorkspace />}
							/>

							<Route
								path={VERIFY_EMAIL_ROUTE}
								element={<VerifyEmail />}
							/>

							{/* used by google ads for conversion tracking */}
							<Route
								path={ABOUT_YOU_ROUTE}
								element={<AdminForm />}
							/>
							<Route
								path={INVITE_TEAM_ROUTE}
								element={<InviteTeamForm />}
							/>

							<Route
								path="/oauth/authorize"
								element={
									<Landing>
										<OAuthApprovalPage />
									</Landing>
								}
							/>

							<Route
								path="/callback/:integrationName"
								element={<IntegrationAuthCallbackPage />}
							/>

							<Route
								path="/subscriptions"
								element={<EmailOptOutPage />}
							/>

							<Route
								path="/switch"
								element={
									isLoggedIn ? (
										<Landing>
											<SwitchWorkspace />
										</Landing>
									) : (
										<Navigate to={SIGN_IN_ROUTE} />
									)
								}
							/>

							<Route
								path="/invite/:invite_id"
								element={
									isLoggedIn ? (
										<WorkspaceInvitation />
									) : (
										<Navigate to={SIGN_UP_ROUTE} />
									)
								}
							/>

							<Route
								path="/w/:workspace_id/switch"
								element={
									isLoggedIn ? (
										<Landing>
											<SwitchProject />
										</Landing>
									) : (
										<Navigate to={SIGN_IN_ROUTE} />
									)
								}
							/>

							<Route
								path="/w/:workspace_id/*"
								element={
									isLoggedIn ? (
										workspaceId &&
										Number.isInteger(
											Number(workspaceId),
										) ? (
											<WorkspaceRouter />
										) : (
											<DefaultWorkspaceRouter />
										)
									) : (
										<Navigate
											to={
												inviteCode
													? SIGN_UP_ROUTE
													: SIGN_IN_ROUTE
											}
										/>
									)
								}
							/>

							<Route
								path="/*"
								element={
									projectId &&
									(isValidProjectId ||
										projectId === DEMO_PROJECT_ID) ? (
										<ProjectRouter />
									) : isLoggedIn ? (
										<ProjectRedirectionRouter />
									) : (
										<AuthRouter />
									)
								}
							/>

							{isHighlightAdmin && (
								<>
									<Route
										path="/accounts/*"
										element={<AccountsPage />}
									/>
									<Route
										path="/_internal/*"
										element={<InternalRouter />}
									/>
								</>
							)}
						</Routes>
					</WithErrorSearchContext>
				</WithSessionSearchContext>
			</ApplicationContextProvider>
		</Box>
	)
}
