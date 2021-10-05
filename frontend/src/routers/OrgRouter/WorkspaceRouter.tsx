import LoginForm from '@pages/Login/Login';
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam';
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext';
import { WorkspaceRedirectionRouter } from '@routers/OrgRouter/WorkspaceRedirectionRouter';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { Header } from '../../components/Header/Header';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { useGetWorkspaceDropdownOptionsQuery } from '../../graph/generated/hooks';
import { ApplicationContextProvider } from './ApplicationContext';

export const WorkspaceRouter = () => {
    const { isLoggedIn } = useAuthContext();
    const [
        showKeyboardShortcutsGuide,
        toggleShowKeyboardShortcutsGuide,
    ] = useToggle(false);
    const { workspace_id } = useParams<{
        workspace_id: string;
    }>();

    const { data, loading, error } = useGetWorkspaceDropdownOptionsQuery({
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

    if (loading) {
        return null;
    }

    return (
        <GlobalContextProvider
            value={{
                showKeyboardShortcutsGuide,
                toggleShowKeyboardShortcutsGuide,
            }}
        >
            <ApplicationContextProvider
                value={{
                    currentProject: undefined,
                    allProjects: data?.projects || [],
                    currentWorkspace: data?.workspace || undefined,
                }}
            >
                <Header />
                {isLoggedIn && <Sidebar />}
                <div className={commonStyles.bodyWrapper}>
                    <Switch>
                        <Route path="/w/:workspace_id(\d+)/team">
                            <WorkspaceTeam />
                        </Route>
                        <Route path="/w/:workspace_id(\d+)/">
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
