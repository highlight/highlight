import 'antd/dist/antd.css';
import './index.scss';
import '@highlight-run/rrweb/dist/index.css';

import { ApolloProvider } from '@apollo/client';
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { ErrorBoundary } from '@highlight-run/react';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { H, HighlightOptions } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { SkeletonTheme } from 'react-loading-skeleton';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import packageJson from '../package.json';
import {
    AuthContextProvider,
    AuthRole,
    isAuthLoading,
    isHighlightAdmin,
    isLoggedIn,
} from './authentication/AuthContext';
import { ErrorState } from './components/ErrorState/ErrorState';
import { useGetAdminLazyQuery } from './graph/generated/hooks';
import LoginForm, { AuthAdminRouter } from './pages/Login/Login';
import * as serviceWorker from './serviceWorker';
import { auth } from './util/auth';
import { showHiringMessage } from './util/console/hiringMessage';
import { client } from './util/graph';

const dev = process.env.NODE_ENV === 'development' ? true : false;
const options: HighlightOptions = {
    debug: { clientInteractions: true, domRecording: true },
    manualStart: true,
    enableStrictPrivacy: Math.floor(Math.random() * 2) === 0,
    version: packageJson['version'],
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
    integrations: {
        mixpanel: {
            projectToken: 'e70039b6a5b93e7c86b8afb02b6d2300',
        },
    },
};
const favicon = document.querySelector("link[rel~='icon']") as any;
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    options.backendUrl = 'http://localhost:8082/public';

    options.integrations = undefined;

    const sampleEnvironmentNames = [
        'john',
        'jay',
        'anthony',
        'cameron',
        'boba',
    ];
    options.environment = `${
        sampleEnvironmentNames[
            Math.floor(Math.random() * sampleEnvironmentNames.length)
        ]
    }-localhost`;
    window.document.title = `⚙️ ${window.document.title}`;
    if (favicon) {
        favicon.href = `${process.env.PUBLIC_URL}/favicon-localhost.ico`;
    }
} else if (window.location.href.includes('onrender')) {
    if (favicon) {
        favicon.href = `${process.env.PUBLIC_URL}/favicon-pr.ico`;
    }
    window.document.title = `📸 ${window.document.title}`;
    options.environment = 'Pull Request Preview';
}
H.init(process.env.REACT_APP_FRONTEND_ORG ?? 1, options);
if (!isOnPrem) {
    H.start();

    window.Intercom('boot', {
        app_id: 'gm6369ty',
        alignment: 'right',
        hide_default_launcher: true,
    });
}

showHiringMessage();

const App = () => {
    return (
        <ErrorBoundary showDialog>
            <ApolloProvider client={client}>
                <QueryParamProvider>
                    <SkeletonTheme color={'#F5F5F5'} highlightColor={'#FCFCFC'}>
                        <AuthenticationRouter />
                    </SkeletonTheme>
                </QueryParamProvider>
            </ApolloProvider>
        </ErrorBoundary>
    );
};

const AuthenticationRouter = () => {
    const [
        getAdminQuery,
        { error: adminError, data: adminData },
    ] = useGetAdminLazyQuery();

    const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING);

    useEffect(() => {
        const unsubscribeFirebase = auth.onAuthStateChanged(
            (user) => {
                if (user) {
                    getAdminQuery();
                } else {
                    setAuthRole(AuthRole.UNAUTHENTICATED);
                }
            },
            (error) => {
                H.consumeError(new Error(JSON.stringify(error)));
                setAuthRole(AuthRole.UNAUTHENTICATED);
            }
        );

        return () => {
            unsubscribeFirebase();
        };
    }, [getAdminQuery, adminData]);

    useEffect(() => {
        if (adminData) {
            if (adminData.admin?.email.includes('@highlight.run')) {
                setAuthRole(AuthRole.AUTHENTICATED_HIGHLIGHT);
            } else if (adminData.admin) {
                setAuthRole(AuthRole.AUTHENTICATED);
            }
            H.track('Authenticated');
        } else if (adminError) {
            setAuthRole(AuthRole.UNAUTHENTICATED);
        }
    }, [adminError, adminData]);

    if (adminError) {
        return (
            <ErrorState
                message={`
Seems like you we had issue with your login 😢.
Feel free to log out and try again, or otherwise,
get in contact with us!
`}
                errorString={JSON.stringify(adminError)}
            />
        );
    }

    return (
        <AuthContextProvider
            value={{
                role: authRole,
                admin: isLoggedIn(authRole)
                    ? adminData?.admin ?? undefined
                    : undefined,
                isAuthLoading: isAuthLoading(authRole),
                isLoggedIn: isLoggedIn(authRole),
                isHighlightAdmin: isHighlightAdmin(authRole),
            }}
        >
            <Router>
                <Switch>
                    <Route path="/:project_id(0)/*" exact>
                        {/* Allow guests to access this route without being asked to log in */}
                        <AuthAdminRouter />
                    </Route>
                    <Route
                        path={`/:project_id(${DEMO_WORKSPACE_PROXY_APPLICATION_ID})/*`}
                        exact
                    >
                        {/* Allow guests to access this route without being asked to log in */}
                        <AuthAdminRouter />
                    </Route>
                    <Route
                        path="/:project_id(\d+)/sessions/:session_secure_id(\w+)"
                        exact
                    >
                        {/* Allow guests to access this route without being asked to log in */}
                        <AuthAdminRouter />
                    </Route>
                    <Route
                        path="/:project_id(\d+)/errors/:error_secure_id(\w+)"
                        exact
                    >
                        {/* Allow guests to access this route without being asked to log in */}
                        <AuthAdminRouter />
                    </Route>
                    <Route path="/">
                        <LoginForm />
                    </Route>
                </Switch>
            </Router>
        </AuthContextProvider>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
