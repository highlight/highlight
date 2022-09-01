import '../../App.scss';

import { useAuthContext } from '@authentication/AuthContext';
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import IntegrationAuthCallbackPage from '@pages/IntegrationAuthCallback/IntegrationAuthCallbackPage';
import { Landing } from '@pages/Landing/Landing';
import { DefaultWorkspaceRouter } from '@routers/OrgRouter/DefaultWorkspaceRouter';
import { ProjectRedirectionRouter } from '@routers/OrgRouter/OrgRedirectionRouter';
import { WorkspaceRouter } from '@routers/OrgRouter/WorkspaceRouter';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import NewMemberPage from '../../pages/NewMember/NewMemberPage';
import styles from './AppRouter.module.scss';

const AccountsPage = lazy(() =>
    import('@pages/Accounts/Accounts').then((m) => ({
        default: m.AccountsPage,
    }))
);
const ProjectRouter = lazy(() =>
    import('../OrgRouter/OrgRouter').then((m) => ({ default: m.ProjectRouter }))
);

const InternalRouter = lazy(() => import('../InternalRouter/InternalRouter'));
const LoginForm = lazy(() => import('@pages/Login/Login'));
const NewProjectPage = lazy(() => import('@pages/NewProject/NewProjectPage'));
const RegistrationForm = lazy(
    () => import('@pages/RegistrationForm/RegistrationForm')
);
const SwitchProject = lazy(() => import('@pages/SwitchProject/SwitchProject'));
const SwitchWorkspace = lazy(
    () => import('@pages/SwitchWorkspace/SwitchWorkspace')
);

export const AppRouter = () => {
    const { isLoggedIn } = useAuthContext();

    return (
        <div className={styles.appBody}>
            <Suspense>
                <Router>
                    <Switch>
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
                        <Route path="/">
                            {isLoggedIn ? (
                                <ProjectRedirectionRouter />
                            ) : (
                                <LoginForm />
                            )}
                        </Route>
                    </Switch>
                </Router>
            </Suspense>
        </div>
    );
};
