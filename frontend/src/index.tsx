import '@highlight-run/react/dist/highlight.css';
import '@highlight-run/rrweb/dist/rrweb.min.css';
import 'antd/dist/antd.css';
import './index.scss';

import { ApolloError, ApolloProvider, QueryLazyOptions } from '@apollo/client';
import {
    AuthContextProvider,
    AuthRole,
    isAuthLoading,
    isHighlightAdmin,
    isLoggedIn,
} from '@authentication/AuthContext';
import { DEMO_WORKSPACE_PROXY_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { ErrorState } from '@components/ErrorState/ErrorState';
import { LoadingPage } from '@components/Loading/Loading';
import {
    AppLoadingContext,
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { datadogLogs } from '@datadog/browser-logs';
import {
    useGetAdminLazyQuery,
    useGetAdminRoleByProjectLazyQuery,
    useGetAdminRoleLazyQuery,
} from '@graph/hooks';
import { Admin, Exact } from '@graph/schemas';
import { ErrorBoundary } from '@highlight-run/react';
import { auth } from '@util/auth';
import { HIGHLIGHT_ADMIN_EMAIL_DOMAINS } from '@util/authorization/authorizationUtils';
import { showHiringMessage } from '@util/console/hiringMessage';
import { client } from '@util/graph';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import { H, HighlightOptions } from 'highlight.run';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Helmet } from 'react-helmet';
import { SkeletonTheme } from 'react-loading-skeleton';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';

import packageJson from '../package.json';
import LoginForm, { AuthAdminRouter } from './pages/Login/Login';

const dev = import.meta.env.MODE === 'development';
let commitSHA = import.meta.env.REACT_APP_COMMIT_SHA || '';
if (commitSHA.length > 8) {
    commitSHA = commitSHA.substring(0, 8);
}
const options: HighlightOptions = {
    debug: { clientInteractions: true, domRecording: true },
    manualStart: true,
    enableStrictPrivacy: Math.floor(Math.random() * 8) === 0,
    version: `${packageJson['version']}${commitSHA}`,
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
    tracingOrigins: ['highlight.run', 'localhost'],
    integrations: {
        mixpanel: {
            projectToken: 'e70039b6a5b93e7c86b8afb02b6d2300',
        },
        amplitude: {
            apiKey: 'fb83ae15d6122ef1b3f0ecdaa3393fea',
        },
    },
    enableSegmentIntegration: true,
    enableCanvasRecording: true,
    samplingStrategy: {
        canvas: 1,
    },
    inlineStylesheet: true,
    inlineImages: true,
    scriptUrl: 'https://static.highlight.run/beta/index.js',
    sessionShortcut: 'alt+1,command+`,alt+esc',
};
const favicon = document.querySelector("link[rel~='icon']") as any;
if (dev) {
    options.scriptUrl = 'http://localhost:8080/dist/index.js';
    options.backendUrl = 'https://localhost:8082/public';

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
        favicon.href = `/favicon-localhost.ico`;
    }
} else if (window.location.href.includes('onrender')) {
    if (favicon) {
        favicon.href = `/favicon-pr.ico`;
    }
    window.document.title = `📸 ${window.document.title}`;
    options.environment = 'Pull Request Preview';
}
H.init(import.meta.env.REACT_APP_FRONTEND_ORG ?? 1, options);
if (!isOnPrem) {
    H.start();

    window.Intercom('boot', {
        app_id: 'gm6369ty',
        alignment: 'right',
        hide_default_launcher: true,
    });

    if (!dev) {
        datadogLogs.init({
            clientToken: 'pub4946b807f59c69ede4bae46eb55dd066',
            site: 'datadoghq.com',
            forwardErrorsToLogs: true,
            sampleRate: 100,
            service: 'frontend',
        });
    }
}

showHiringMessage();

const App = () => {
    const [loadingState, setLoadingState] = useState<AppLoadingState>(
        AppLoadingState.LOADING
    );

    return (
        <ErrorBoundary
            showDialog
            onAfterReportDialogCancelHandler={() => {
                const { origin } = window.location;
                window.location.href = origin;
            }}
        >
            <ApolloProvider client={client}>
                <QueryParamProvider>
                    <SkeletonTheme
                        baseColor={'var(--color-gray-200)'}
                        highlightColor={'var(--color-primary-background)'}
                    >
                        <AppLoadingContext
                            value={{
                                loadingState,
                                setLoadingState,
                            }}
                        >
                            <LoadingPage />
                            <Router>
                                <Switch>
                                    <Route path="/w/:workspace_id(\d+)/*">
                                        <AuthenticationRoleRouter />
                                    </Route>
                                    <Route path="/:project_id(\d+)/*">
                                        <AuthenticationRoleRouter />
                                    </Route>
                                    <Route path="/">
                                        <AuthenticationRoleRouter />
                                    </Route>
                                </Switch>
                            </Router>
                        </AppLoadingContext>
                    </SkeletonTheme>
                </QueryParamProvider>
            </ApolloProvider>
        </ErrorBoundary>
    );
};

const AuthenticationRoleRouter = () => {
    const { workspace_id, project_id } =
        useParams<{
            workspace_id: string;
            project_id: string;
        }>();
    const [
        getWorkspaceAdminsQuery,
        {
            error: adminWError,
            data: adminWData,
            called: wCalled,
            refetch: wRefetch,
        },
    ] = useGetAdminRoleLazyQuery();
    const [
        getWorkspaceAdminsByProjectIdQuery,
        {
            error: adminPError,
            data: adminPData,
            called: pCalled,
            refetch: pRefetch,
        },
    ] = useGetAdminRoleByProjectLazyQuery();
    const [
        getAdminSimpleQuery,
        {
            error: adminSError,
            data: adminSData,
            called: sCalled,
            refetch: sRefetch,
        },
    ] = useGetAdminLazyQuery();
    let getAdminQuery:
            | ((
                  workspace_id:
                      | QueryLazyOptions<Exact<{ workspace_id: string }>>
                      | undefined
              ) => void)
            | ((
                  project_id:
                      | QueryLazyOptions<Exact<{ project_id: string }>>
                      | undefined
              ) => void)
            | (() => void),
        adminError: ApolloError | undefined,
        adminData: Admin | undefined | null,
        adminRole: string | undefined,
        called: boolean,
        refetch: any;
    if (workspace_id) {
        getAdminQuery = getWorkspaceAdminsQuery;
        adminError = adminWError;
        adminData = adminWData?.admin_role?.admin;
        adminRole = adminWData?.admin_role?.role;
        called = wCalled;
        refetch = wRefetch;
    } else if (project_id) {
        getAdminQuery = getWorkspaceAdminsByProjectIdQuery;
        adminError = adminPError;
        adminData = adminPData?.admin_role_by_project?.admin;
        adminRole = adminPData?.admin_role_by_project?.role;
        called = pCalled;
        refetch = pRefetch;
    } else {
        getAdminQuery = getAdminSimpleQuery;
        adminError = adminSError;
        adminData = adminSData?.admin;
        called = sCalled;
        refetch = sRefetch;
    }

    const { setLoadingState } = useAppLoadingContext();

    const [authRole, setAuthRole] = useState<AuthRole>(AuthRole.LOADING);

    useEffect(() => {
        const unsubscribeFirebase = auth.onAuthStateChanged(
            (user) => {
                if (user) {
                    if (!called) {
                        getAdminQuery({
                            variables: { workspace_id, project_id },
                        });
                    } else {
                        refetch!();
                    }
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
    }, [getAdminQuery, adminData, called, refetch, workspace_id, project_id]);

    useEffect(() => {
        if (adminData) {
            if (
                HIGHLIGHT_ADMIN_EMAIL_DOMAINS.some((d) =>
                    adminData?.email.includes(d)
                )
            ) {
                setAuthRole(AuthRole.AUTHENTICATED_HIGHLIGHT);
            } else if (adminData) {
                setAuthRole(AuthRole.AUTHENTICATED);
            }
            H.track('Authenticated');
        } else if (adminError) {
            setAuthRole(AuthRole.UNAUTHENTICATED);
        }
    }, [adminError, adminData]);

    useEffect(() => {
        if (authRole === AuthRole.UNAUTHENTICATED) {
            setLoadingState(
                isAuthLoading(authRole)
                    ? AppLoadingState.LOADING
                    : AppLoadingState.LOADED
            );
        }
    }, [authRole, setLoadingState]);

    return (
        <AuthContextProvider
            value={{
                role: authRole,
                admin: isLoggedIn(authRole)
                    ? adminData ?? undefined
                    : undefined,
                workspaceRole: adminRole,
                isAuthLoading: isAuthLoading(authRole),
                isLoggedIn: isLoggedIn(authRole),
                isHighlightAdmin: isHighlightAdmin(authRole),
            }}
        >
            <Helmet>
                <title>Highlight App</title>
            </Helmet>
            {adminError ? (
                <ErrorState
                    message={`
Seems like we had an issue with your login 😢.
Feel free to log out and try again, or otherwise,
get in contact with us!
`}
                    errorString={JSON.stringify(adminError)}
                />
            ) : (
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
            )}
        </AuthContextProvider>
    );
};

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
