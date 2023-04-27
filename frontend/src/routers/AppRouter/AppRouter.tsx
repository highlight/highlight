import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui'
import { useNumericProjectId } from '@hooks/useProjectId'
import { AccountsPage } from '@pages/Accounts/Accounts'
import { AdminForm } from '@pages/Auth/AdminForm'
import { AuthRouter, SIGN_IN_ROUTE } from '@pages/Auth/AuthRouter'
import { JoinWorkspace } from '@pages/Auth/JoinWorkspace'
import { VerifyEmail } from '@pages/Auth/VerifyEmail'
import { EmailOptOutPage } from '@pages/EmailOptOut/EmailOptOut'
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import { Landing } from '@pages/Landing/Landing'
import NewProjectPage from '@pages/NewProject/NewProjectPage'
import OAuthApprovalPage from '@pages/OAuthApproval/OAuthApprovalPage'
import RegistrationForm from '@pages/RegistrationForm/RegistrationForm'
import SwitchProject from '@pages/SwitchProject/SwitchProject'
import SwitchWorkspace from '@pages/SwitchWorkspace/SwitchWorkspace'
import useLocalStorage from '@rehooks/local-storage'
import InternalRouter from '@routers/InternalRouter/InternalRouter'
import { DefaultWorkspaceRouter } from '@routers/ProjectRouter/DefaultWorkspaceRouter'
import { ProjectRedirectionRouter } from '@routers/ProjectRouter/ProjectRedirectionRouter'
import { ProjectRouter } from '@routers/ProjectRouter/ProjectRouter'
import { WorkspaceRouter } from '@routers/ProjectRouter/WorkspaceRouter'
import analytics from '@util/analytics'
import { auth } from '@util/auth'
import { showIntercom } from '@util/window'
import { omit } from 'lodash'
import React, { useEffect } from 'react'
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

export const AppRouter = () => {
	const { admin, isLoggedIn, isAuthLoading, isHighlightAdmin } =
		useAuthContext()
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const workspaceId = workspaceMatch?.params.workspace_id
	const workspaceInviteMatch = useMatch('/w/:workspace_id/invite/:invite')
	const inviteMatch = useMatch('/invite/:invite')
	const isInvitePage = !!inviteMatch
	const [inviteCode, setInviteCode] = useLocalStorage('highlightInviteCode')
	const { projectId } = useNumericProjectId()
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const navigate = useNavigate()

	useEffect(() => {
		if (workspaceInviteMatch?.params.invite) {
			setInviteCode(workspaceInviteMatch.params.invite)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (admin && admin.email_verified === false) {
			navigate('/verify_email', { replace: true })
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
			!isInvitePage
		) {
			navigate('/about_you', { replace: true })
			return
		}

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
			showIntercom({ admin, hideMessage: true })
		}
	}, [admin])

	if (isAuthLoading) {
		return null
	}

	return (
		<Box height="screen" width="screen">
			<Routes>
				{isLoggedIn && !admin?.about_you_details_filled && (
					//  /about_you is used by google ads for conversion tracking
					<Route path="/about_you" element={<AdminForm />} />
				)}

				{/*
				Not using isLoggedIn because this is shown immediately after sign up and
				there can be a state briefly where the user authenticated in Firebase
				but their admin account isn't created yet.
				*/}
				{auth.currentUser && !admin?.email_verified && (
					<Route path="/verify_email" element={<VerifyEmail />} />
				)}

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

				<Route path="/subscriptions" element={<EmailOptOutPage />} />

				<Route
					path="/new"
					element={
						isLoggedIn ? (
							<Landing>
								<NewProjectPage />
							</Landing>
						) : (
							<Navigate to={SIGN_IN_ROUTE} />
						)
					}
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
							<JoinWorkspace />
						) : (
							<Navigate to="/sign_up" />
						)
					}
				/>

				<Route
					path="/w/:workspace_id/new"
					element={
						isLoggedIn ? (
							<Landing>
								<NewProjectPage />
							</Landing>
						) : (
							<Navigate to={SIGN_IN_ROUTE} />
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
					path="/w/:workspace_id/about-you"
					element={
						isLoggedIn ? (
							<Landing>
								<RegistrationForm />
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
							<Navigate to={SIGN_IN_ROUTE} />
						)
					}
				/>

				<Route
					path="/*"
					element={
						projectId && Number.isInteger(Number(projectId)) ? (
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
						<Route path="/accounts/*" element={<AccountsPage />} />
						<Route
							path="/_internal/*"
							element={<InternalRouter />}
						/>
					</>
				)}
			</Routes>
		</Box>
	)
}
