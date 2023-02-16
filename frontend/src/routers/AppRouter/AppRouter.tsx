import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui'
import { useNumericProjectId } from '@hooks/useProjectId'
import { AccountsPage } from '@pages/Accounts/Accounts'
import { AdminForm } from '@pages/Auth/AdminForm'
import { AuthRouter } from '@pages/Auth/AuthRouter'
import { VerifyEmail } from '@pages/Auth/VerifyEmail'
import { EmailOptOutPage } from '@pages/EmailOptOut/EmailOptOut'
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import { Landing } from '@pages/Landing/Landing'
import NewMemberPage from '@pages/NewMember/NewMemberPage'
import NewProjectPage from '@pages/NewProject/NewProjectPage'
import OAuthApprovalPage from '@pages/OAuthApproval/OAuthApprovalPage'
import RegistrationForm from '@pages/RegistrationForm/RegistrationForm'
import SwitchProject from '@pages/SwitchProject/SwitchProject'
import SwitchWorkspace from '@pages/SwitchWorkspace/SwitchWorkspace'
import InternalRouter from '@routers/InternalRouter/InternalRouter'
import { DefaultWorkspaceRouter } from '@routers/OrgRouter/DefaultWorkspaceRouter'
import { ProjectRedirectionRouter } from '@routers/OrgRouter/OrgRedirectionRouter'
import { ProjectRouter } from '@routers/OrgRouter/ProjectRouter'
import { WorkspaceRouter } from '@routers/OrgRouter/WorkspaceRouter'
import React, { useEffect } from 'react'
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

export const AppRouter = () => {
	const { admin, isLoggedIn } = useAuthContext()
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const workspaceId = workspaceMatch?.params.workspace_id
	const { projectId } = useNumericProjectId()
	const [nextParam] = useQueryParam('next', StringParam)
	const [configurationIdParam] = useQueryParam('configurationId', StringParam)
	const isVercelIntegrationFlow = !!nextParam || !!configurationIdParam
	const navigate = useNavigate()

	useEffect(() => {
		if (admin && admin.email_verified === false) {
			navigate('/verify_email')
			return
		}

		if (
			admin &&
			!admin.about_you_details_filled &&
			!isVercelIntegrationFlow
		) {
			navigate('/about_you')
			return
		}
	}, [admin, isVercelIntegrationFlow, navigate])

	return (
		<Box height="screen" width="screen">
			<Routes>
				<Route path="/verify_email" element={<VerifyEmail />} />
				<Route path="/about_you" element={<AdminForm />} />

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
				<Route path="/accounts/*" element={<AccountsPage />} />

				<Route path="/_internal/*" element={<InternalRouter />} />

				<Route
					path="/new"
					element={
						<Landing>
							<NewProjectPage />
						</Landing>
					}
				/>

				<Route
					path="/switch"
					element={
						<Landing>
							<SwitchWorkspace />
						</Landing>
					}
				/>

				<Route
					path="/w/:workspace_id/invite/:invite_id"
					element={
						<Landing>
							<NewMemberPage />
						</Landing>
					}
				/>

				<Route
					path="/w/:workspace_id/new"
					element={
						<Landing>
							<NewProjectPage />
						</Landing>
					}
				/>

				<Route
					path="/w/:workspace_id/switch"
					element={
						<Landing>
							<SwitchProject />
						</Landing>
					}
				/>

				<Route
					path="/w/:workspace_id/about-you"
					element={
						<Landing>
							<RegistrationForm />
						</Landing>
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
							<AuthRouter />
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
			</Routes>
		</Box>
	)
}
