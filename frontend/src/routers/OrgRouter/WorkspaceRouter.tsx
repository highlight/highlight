import { useAppLoadingContext } from '@context/AppLoadingContext';
import LoginForm from '@pages/Login/Login';
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings';
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam';
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext';
import { WorkspaceRedirectionRouter } from '@routers/OrgRouter/WorkspaceRedirectionRouter';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import React, { Suspense, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { Header } from '../../components/Header/Header';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { useGetWorkspaceDropdownOptionsQuery } from '../../graph/generated/hooks';
import { ApplicationContextProvider } from './ApplicationContext';

const BillingPage = React.lazy(() => import('../../pages/Billing/Billing'));

export const WorkspaceRouter = () => {
    const { isLoggedIn } = useAuthContext();
    const [
        showKeyboardShortcutsGuide,
        toggleShowKeyboardShortcutsGuide,
    ] = useToggle(false);
    const [showBanner, toggleShowBanner] = useToggle(false);

    const { workspace_id } = useParams<{
        workspace_id: string;
    }>();
    const { setIsLoading } = useAppLoadingContext();

    const { data, loading } = useGetWorkspaceDropdownOptionsQuery({
        variables: { workspace_id },
        skip: !isLoggedIn, // Higher level routers decide when guests are allowed to hit this router
    });

    useEffect(() => {
        if (!isOnPrem) {
            window.Intercom('update', {
                hide_default_launcher: true,
            });
        }
        return () => {
            if (!isOnPrem) {
                window.Intercom('update', {
                    hide_default_launcher: false,
                });
            }
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            document.documentElement.style.setProperty(
                '--sidebar-width',
                '64px'
            );
        } else {
            document.documentElement.style.setProperty('--sidebar-width', '0');
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            setIsLoading(false);
        }
    }, [isLoggedIn, setIsLoading]);

    if (loading) {
        return null;
    }

    return (
        <GlobalContextProvider
            value={{
                showKeyboardShortcutsGuide,
                toggleShowKeyboardShortcutsGuide,
                showBanner,
                toggleShowBanner,
            }}
        >
            <ApplicationContextProvider
                value={{
                    currentProject: undefined,
                    allProjects: data?.workspace?.projects || [],
                    currentWorkspace: data?.workspace || undefined,
                    workspaces: data?.workspaces || [],
                }}
            >
                <Header />
                {isLoggedIn && <Sidebar />}
                <div className={commonStyles.bodyWrapper}>
                    <Switch>
                        <Route path="/w/:workspace_id(\d+)/team">
                            <WorkspaceTeam />
                        </Route>
                        <Route path="/w/:workspace_id(\d+)/settings">
                            <WorkspaceSettings />
                        </Route>
                        <Route path="/w/:workspace_id(\d+)/billing">
                            <Suspense fallback={null}>
                                <BillingPage />
                            </Suspense>
                        </Route>
                        <Route path="/w/:workspace_id(\d+)">
                            {isLoggedIn ? (
                                <WorkspaceRedirectionRouter />
                            ) : (
                                <LoginForm />
                            )}
                        </Route>
                    </Switch>
                </div>
            </ApplicationContextProvider>
        </GlobalContextProvider>
    );
};
