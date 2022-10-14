import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { AccountsPage } from '@pages/Accounts/Accounts'
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage'
import { Landing } from '@pages/Landing/Landing'
import LoginForm from '@pages/Login/Login'
import NewProjectPage from '@pages/NewProject/NewProjectPage'
import OAuthApprovalPage from '@pages/OAuthApproval/OAuthApprovalPage'
import RegistrationForm from '@pages/RegistrationForm/RegistrationForm'
import SwitchProject from '@pages/SwitchProject/SwitchProject'
import SwitchWorkspace from '@pages/SwitchWorkspace/SwitchWorkspace'
import { DefaultWorkspaceRouter } from '@routers/OrgRouter/DefaultWorkspaceRouter'
import { ProjectRedirectionRouter } from '@routers/OrgRouter/ProjectRedirectionRouter'
import { WorkspaceRouter } from '@routers/OrgRouter/WorkspaceRouter'
import React from 'react'
import { Route, Routes, useMatch } from 'react-router-dom'

import NewMemberPage from '../../pages/NewMember/NewMemberPage'
import InternalRouter from '../InternalRouter/InternalRouter'
import { ProjectRouter } from '../OrgRouter/ProjectRouter'
import styles from './AppRouter.module.scss'

export const AppRouter = () => {
	const { isLoggedIn } = useAuthContext()
	const projectMatch = useMatch('/:project_id/*')
	const projectId = projectMatch?.params.project_id
	const workspaceMatch = useMatch('/w/:workspace_id/*')
	const workspaceId = workspaceMatch?.params.workspace_id

	return (
		<div className={styles.appBody}>
			<Routes>
				<Route path="/accounts" element={<AccountsPage />} />
				<Route
					path="/w/:workspace_id/invite/:invite_id"
					element={
						<Landing>
							<NewMemberPage />
						</Landing>
					}
				/>
				<Route
					path="/new"
					element={
						<Landing>
							<NewProjectPage />
						</Landing>
					}
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
					path="/switch"
					element={
						<Landing>
							<SwitchWorkspace />
						</Landing>
					}
				/>
				<Route path="/_internal" element={<InternalRouter />} />
				<Route
					path="/*"
					element={
						isLoggedIn ? (
							workspaceId ? (
								Number.isInteger(workspaceId) ? (
									<WorkspaceRouter />
								) : (
									<DefaultWorkspaceRouter />
								)
							) : projectId ? (
								<ProjectRouter />
							) : (
								<ProjectRedirectionRouter />
							)
						) : (
							<LoginForm />
						)
					}
				/>
			</Routes>
		</div>
	)
}
