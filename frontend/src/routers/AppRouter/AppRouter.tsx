import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
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
import { ProjectRedirectionRouter } from '@routers/OrgRouter/OrgRedirectionRouter'
import { WorkspaceRouter } from '@routers/OrgRouter/WorkspaceRouter'
import React from 'react'
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Switch,
} from 'react-router-dom'

import NewMemberPage from '../../pages/NewMember/NewMemberPage'
import InternalRouter from '../InternalRouter/InternalRouter'
import { ProjectRouter } from '../OrgRouter/OrgRouter'
import styles from './AppRouter.module.scss'

export const AppRouter = () => {
	const { isLoggedIn } = useAuthContext()

	return (
		<div className={styles.appBody}>
			<Routes>
				<Route path="/accounts" element={<AccountsPage />} />
				<Route
					path="/w/:workspace_id(\d+)/invite/:invite_id"
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
					path="/w/:workspace_id(\d+)/new"
					element={
						<Landing>
							<NewProjectPage />
						</Landing>
					}
				/>
				<Route
					path="/w/:workspace_id(\d+)/switch"
					element={
						<Landing>
							<SwitchProject />
						</Landing>
					}
				/>
				<Route
					path="/w/:workspace_id(\d+)/about-you"
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
				<Route path="/:project_id(\d+)" element={<ProjectRouter />} />
				<Route
					path={`/:project_id(${DEMO_WORKSPACE_PROXY_APPLICATION_ID})`}
					element={<ProjectRouter />}
				/>
				<Route
					path="/w/:workspace_id(\d+)"
					element={<WorkspaceRouter />}
				/>
				<Route
					path="/w/:page_id(team|settings|current-plan|upgrade-plan)"
					element={<DefaultWorkspaceRouter />}
				/>
				<Route
					path="/"
					element={
						isLoggedIn ? (
							<ProjectRedirectionRouter />
						) : (
							<LoginForm />
						)
					}
				/>
			</Routes>
		</div>
	)
}
