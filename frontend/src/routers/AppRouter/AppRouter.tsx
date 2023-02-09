import '../../App.scss'

import { useAuthContext } from '@authentication/AuthContext'
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { Box } from '@highlight-run/ui'
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
import { ProjectRouter } from '@routers/OrgRouter/OrgRouter'
import { WorkspaceRouter } from '@routers/OrgRouter/WorkspaceRouter'
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

export const AppRouter = () => {
	const { isLoggedIn } = useAuthContext()

	return (
		<Box height="screen" width="screen">
			<Router>
				<Switch>
					<Route path="/subscriptions">
						<EmailOptOutPage />
					</Route>
					<Route path="/accounts">
						<AccountsPage />
					</Route>
					<Route path="/w/:workspace_id(\d+)/invite/:invite_id">
						<Landing>
							<NewMemberPage />
						</Landing>
					</Route>
					<Route path="/new">
						<Landing>
							<NewProjectPage />
						</Landing>
					</Route>
					<Route path="/oauth/authorize">
						<Landing>
							<OAuthApprovalPage />
						</Landing>
					</Route>
					<Route path="/callback/:integrationName">
						<IntegrationAuthCallbackPage />
					</Route>
					<Route path="/w/:workspace_id(\d+)/new">
						<Landing>
							<NewProjectPage />
						</Landing>
					</Route>
					<Route path="/w/:workspace_id(\d+)/switch">
						<Landing>
							<SwitchProject />
						</Landing>
					</Route>
					<Route path="/w/:workspace_id(\d+)/about-you">
						<Landing>
							<RegistrationForm />
						</Landing>
					</Route>
					<Route path="/switch">
						<Landing>
							<SwitchWorkspace />
						</Landing>
					</Route>
					<Route path="/_internal">
						<InternalRouter />
					</Route>
					<Route path="/:project_id(\d+)">
						<ProjectRouter />
					</Route>
					<Route
						path={`/:project_id(${DEMO_WORKSPACE_PROXY_APPLICATION_ID})`}
					>
						<ProjectRouter />
					</Route>
					<Route path="/w/:workspace_id(\d+)">
						<WorkspaceRouter />
					</Route>
					<Route path="/w/:page_id(team|settings|current-plan|upgrade-plan)">
						<DefaultWorkspaceRouter />
					</Route>
					<Route path="/verify_email">
						{/* TODO: Move component */}
						<VerifyEmail />
					</Route>
					<Route path="/about_you">
						{/* TODO: Move component */}
						<AdminForm />
					</Route>
					<Route path="/">
						{isLoggedIn ? (
							<ProjectRedirectionRouter />
						) : (
							<AuthRouter />
						)}
					</Route>
				</Switch>
			</Router>
		</Box>
	)
}
