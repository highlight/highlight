import { ErrorState } from '@components/ErrorState/ErrorState';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import LoginForm from '@pages/Login/Login';
import { WorkspaceTabs } from '@pages/WorkspaceTabs/WorkspaceTabs';
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext';
import { WorkspaceRedirectionRouter } from '@routers/OrgRouter/WorkspaceRedirectionRouter';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { Header } from '../../components/Header/Header';
import { useGetWorkspaceDropdownOptionsQuery } from '../../graph/generated/hooks';
import { ApplicationContextProvider } from './ApplicationContext';

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
    const { setLoadingState } = useAppLoadingContext();

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
            setLoadingState(AppLoadingState.LOADED);
        }
    }, [isLoggedIn, setLoadingState]);

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
                <div
                    className={classNames(
                        commonStyles.bodyWrapper,
                        commonStyles.sidebarHidden
                    )}
                >
                    {isLoggedIn && data?.workspace === null ? (
                        <ErrorState
                            message={`
                        Seems like you don’t have access to this page 😢. If you're
                        part of a team, ask your project admin to send you an
                        invite. Otherwise, feel free to make an account!
                        `}
                            shownWithHeader
                        />
                    ) : (
                        <>
                            <Switch>
                                <Route path="/w/:workspace_id(\d+)/:page_id(team|settings|billing)">
                                    <WorkspaceTabs />
                                </Route>
                                <Route path="/w/:workspace_id(\d+)">
                                    {isLoggedIn ? (
                                        <WorkspaceRedirectionRouter />
                                    ) : (
                                        <LoginForm />
                                    )}
                                </Route>
                            </Switch>
                        </>
                    )}
                </div>
            </ApplicationContextProvider>
        </GlobalContextProvider>
    );
};
