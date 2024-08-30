import '../../App.css'

import { useAuthContext } from '@authentication/AuthContext'
import { DemoModal } from '@components/DemoModal/DemoModal'
import { Box } from '@highlight-run/ui/components'
import { useNumericProjectId } from '@hooks/useProjectId'
import { AccountsPage } from '@pages/Accounts/Accounts'
import { AdminForm } from '@pages/Auth/AdminForm'
import {
	AuthRouter,
	SIGN_IN_ROUTE,
	SIGN_UP_ROUTE,
} from '@pages/Auth/AuthRouter'
import { Firebase } from '@pages/Auth/Firebase'
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
import log from '@util/log'
import { lazy, Suspense, useEffect } from 'react'
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useMatch,
	useNavigate,
	useNavigationType,
} from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'
import {
	useGetDropdownOptionsQuery,
	useGetProjectOrWorkspaceQuery,
} from '@/graph/generated/hooks'
import { JoinWorkspace } from '@/pages/Auth/JoinWorkspace'
import { WorkspaceInvitation } from '@/pages/Auth/WorkspaceInvitation'
import {
	ErrorTags,
	ErrorTagsAdmin,
	ErrorTagsContainer,
	ErrorTagsSearch,
} from '@/pages/ErrorTags'

const Buttons = lazy(() => import('../../pages/Buttons/Buttons'))
const CanvasPage = lazy(() => import('../../pages/Buttons/CanvasV2'))
const HitTargets = lazy(() => import('../../pages/Buttons/HitTargets'))

export const FIREBASE_CALLBACK_ROUTE = '/auth/action'
export const VERIFY_EMAIL_ROUTE = '/verify_email'
export const ABOUT_YOU_ROUTE = '/about_you'
export const INVITE_TEAM_ROUTE = '/invite_team'
export const SETUP_ROUTE = '/setup'

// DebugRoutes is a helper for debugging react router navigation.
// Enable debug logging by setting the localStorage variable `highlight-verbose-logging-enabled` to true.
const DebugRoutes: React.FC<React.PropsWithChildren> = ({ children }) => {
	const location = useLocation()
	const action = useNavigationType()
	log(
		'AppRouter.tsx',
		'initial history is: ',
		JSON.stringify(history, null, 2),
	)
	useEffect(() => {
		log(
			'AppRouter.tsx',
			`The current URL is ${location.pathname}${location.search}${location.hash}`,
		)
		log(
			'AppRouter.tsx',
			`The last navigation action was ${action}`,
			JSON.stringify(history, null, 2),
		)
	}, [action, location])
	return <>{children}</>
}

export const AppRouter = () => {
	const { admin, isLoggedIn, isAuthLoading, isHighlightAdmin } =
		useAuthContext()
	const location = useLocation()
	const previousLocation = location.state?.previousLocation as
		| Location
		| undefined
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const newProjectMatch = useMatch('/new')
	const newWorkspaceMatch = useMatch('/w/:workspace_id/new')
	const workspaceId = workspaceMatch?.params.workspace_id
	const workspaceInviteMatch = useMatch('/w/:workspace_id/invite/:invite')
	const inviteMatch = useMatch('/invite/:invite')
	const inviteTeamMatch = useMatch(INVITE_TEAM_ROUTE)
	const joinWorkspaceMatch = useMatch('/join_workspace')
	const firebaseMatch = useMatch(FIREBASE_CALLBACK_ROUTE)
	const isFirebasePage = !!firebaseMatch
	const isInvitePage = !!inviteMatch
	const isNewProjectPage = !!newWorkspaceMatch
	const isNewWorkspacePage = !!newProjectMatch
	const isJoinWorkspacePage = !!joinWorkspaceMatch
	const [inviteCode, setInviteCode] = useLocalStorage('highlightInviteCode')
	const { projectId } = useNumericProjectId(previousLocation)
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const navigate = useNavigate()
	const isValidProjectId = Number.isInteger(Number(projectId))

	const { data, loading } = useGetDropdownOptionsQuery({
		skip: !isLoggedIn,
	})

	const { data: projectOrWorkspaceData, loading: projectOrWorkspaceLoading } =
		useGetProjectOrWorkspaceQuery({
			variables: {
				project_id: projectId ?? '',
				workspace_id: workspaceId ?? '',
				is_workspace: !isValidProjectId,
			},
			skip: !isLoggedIn,
		})

	useEffect(() => {
		if (workspaceInviteMatch?.params.invite) {
			setInviteCode(workspaceInviteMatch.params.invite)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (
			!isFirebasePage &&
			!isInvitePage &&
			admin &&
			admin.email_verified === false
		) {
			navigate(VERIFY_EMAIL_ROUTE, { replace: true })
			return
		}

		if (
			admin &&
			inviteCode &&
			inviteCode !== 'ignored' &&
			!isInvitePage &&
			!isFirebasePage
		) {
			navigate(`/invite/${inviteCode}`, { replace: true })
			return
		}

		if (
			admin &&
			!admin.about_you_details_filled &&
			!inviteTeamMatch &&
			!isVercelIntegrationFlow &&
			!isInvitePage &&
			!isFirebasePage &&
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
		inviteTeamMatch,
		isInvitePage,
		projectId,
		isJoinWorkspacePage,
		location.pathname,
		location.search,
		isFirebasePage,
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

			analytics.identify(admin.id, identifyMetadata)
		}
	}, [admin])

	const currentProject =
		data?.projects?.find((p) => p?.id === projectId) ||
		projectOrWorkspaceData?.project ||
		undefined
	const currentWorkspaceId = currentProject?.workspace_id || workspaceId
	let projectsInWorkspace =
		data?.projects?.filter((p) => p?.workspace_id === currentWorkspaceId) ||
		[]
	if (projectsInWorkspace.length === 0) {
		projectsInWorkspace = projectOrWorkspaceData?.workspace?.projects || []
	}
	if (projectsInWorkspace.length === 0) {
		projectsInWorkspace =
			projectOrWorkspaceData?.project?.workspace?.projects || []
	}

	const currentWorkspace =
		data?.workspaces?.find((w) => w?.id === currentWorkspaceId) ||
		(currentWorkspaceId === undefined && data?.workspaces?.at(0)) ||
		projectOrWorkspaceData?.workspace ||
		projectOrWorkspaceData?.project?.workspace ||
		undefined

	// Ensure auth and current workspace data has loaded
	if (
		isAuthLoading ||
		loading ||
		(!currentWorkspace && projectOrWorkspaceLoading)
	) {
		return null
	}

	return (
		<Box height="screen" width="screen">
			<ApplicationContextProvider
				value={{
					loading: false,
					currentProject: currentProject,
					allProjects: projectsInWorkspace,
					currentWorkspace: currentWorkspace,
					workspaces: data?.workspaces ?? [],
					joinableWorkspaces: data?.joinable_workspaces ?? [],
				}}
			>
				{(isNewWorkspacePage || isNewProjectPage) && isLoggedIn ? (
					<NewProjectPage
						workspace_id={
							isNewProjectPage ? workspaceId : undefined
						}
					/>
				) : null}
				{projectId === DEMO_PROJECT_ID ? <DemoModal /> : null}
				<DebugRoutes>
					<Routes location={previousLocation ?? location}>
						<Route
							path="debug/buttons/*"
							element={
								<Suspense fallback={null}>
									<Buttons />
								</Suspense>
							}
						/>
						<Route
							path="debug/canvas/*"
							element={
								<Suspense fallback={null}>
									<CanvasPage />
								</Suspense>
							}
						/>
						<Route
							path="debug/hit-targets/*"
							element={
								<Suspense fallback={null}>
									<HitTargets />
								</Suspense>
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

						<Route
							path={FIREBASE_CALLBACK_ROUTE}
							element={<Firebase />}
						/>

						{/* used by google ads for conversion tracking */}
						<Route path={ABOUT_YOU_ROUTE} element={<AdminForm />} />
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
									Number.isInteger(Number(workspaceId)) ? (
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
									isNewWorkspacePage ||
									isNewProjectPage ? undefined : (
										<ProjectRedirectionRouter />
									)
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
				</DebugRoutes>
			</ApplicationContextProvider>
		</Box>
	)
}
