import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { Box } from '@highlight-run/ui'
import { AccountsPage } from '@pages/Accounts/Accounts'
import { EmailOptOutPage } from '@pages/EmailOptOut/EmailOptOut'
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import { Landing } from '@pages/Landing/Landing'
import LoginForm from '@pages/Login/Login'
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
import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'

export const AppRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const projectMatch = useMatch('/:project_id/*')
	const projectId = projectMatch?.params.project_id
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const workspaceId = workspaceMatch?.params.workspace_id

	return (
		<Box height="screen" width="screen">
			<Routes>
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
							<LoginForm />
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
							<LoginForm />
						)
					}
				/>
			</Routes>
		</Box>
	)
}
