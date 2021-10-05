import '../../App.scss';

import { useAuthContext } from '@authentication/AuthContext';
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import LoginForm from '@pages/Login/Login';
import { ProjectRedirectionRouter } from '@routers/OrgRouter/OrgRedirectionRouter';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Landing } from '../../pages/Landing/Landing';
import NewMemberPage from '../../pages/NewMember/NewMemberPage';
import NewWorkspacePage from '../../pages/NewWorkspace/NewWorkspacePage';
import InternalRouter from '../InternalRouter/InternalRouter';
import { ProjectRouter } from '../OrgRouter/OrgRouter';
import styles from './AppRouter.module.scss';

export const AppRouter = () => {
    const { isLoggedIn } = useAuthContext();

    return (
        <div className={styles.appBody}>
            <Router>
                <Switch>
                    <Route path="/:project_id(\d+)/invite/:invite_id">
                        <Landing>
                            <NewMemberPage />
                        </Landing>
                    </Route>
                    <Route path="/new">
                        <Landing>
                            <NewWorkspacePage />
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
                    <Route path="/">
                        {isLoggedIn ? (
                            <ProjectRedirectionRouter />
                        ) : (
                            <LoginForm />
                        )}
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};
