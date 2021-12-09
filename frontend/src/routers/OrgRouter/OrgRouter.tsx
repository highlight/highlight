import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useAppLoadingContext } from '@context/AppLoadingContext';
import useLocalStorage from '@rehooks/local-storage';
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useToggle } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import commonStyles from '../../Common.module.scss';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { Header } from '../../components/Header/Header';
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { useGetProjectDropdownOptionsQuery } from '../../graph/generated/hooks';
import { useIntegrated } from '../../util/integrated';
import { ApplicationContextProvider } from './ApplicationContext';
import ApplicationRouter from './ApplicationRouter';

export const ProjectRouter = () => {
    const { isLoggedIn } = useAuthContext();
    const [
        showKeyboardShortcutsGuide,
        toggleShowKeyboardShortcutsGuide,
    ] = useToggle(false);
    const [showBanner, toggleShowBanner] = useToggle(false);
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const { setIsLoading } = useAppLoadingContext();

    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    const { data, loading, error } = useGetProjectDropdownOptionsQuery({
        variables: { project_id },
        skip: !isLoggedIn, // Higher level routers decide when guests are allowed to hit this router
    });

    const { integrated, loading: integratedLoading } = useIntegrated();
    const [hasFinishedOnboarding] = useLocalStorage(
        `highlight-finished-onboarding-${project_id}`,
        false
    );

    useEffect(() => {
        data?.workspace?.id &&
            window.Intercom('update', {
                company: {
                    id: data?.workspace.id,
                    name: data?.workspace.name,
                },
            });
    }, [data?.workspace]);

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
        if (
            isLoggedIn ||
            projectIdRemapped === DEMO_WORKSPACE_PROXY_APPLICATION_ID
        ) {
            document.documentElement.style.setProperty(
                '--sidebar-width',
                '64px'
            );
        } else {
            document.documentElement.style.setProperty('--sidebar-width', '0');
        }
    }, [isLoggedIn, projectIdRemapped]);

    useEffect(() => {
        if (!error) {
            setIsLoading(loading || integratedLoading);
        } else {
            setIsLoading(false);
        }
    }, [error, integratedLoading, loading, setIsLoading]);

    if (loading || integratedLoading) {
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
                    currentProject: data?.project || undefined,
                    allProjects: data?.workspace?.projects || [],
                    currentWorkspace: data?.workspace || undefined,
                    workspaces: data?.workspaces || [],
                }}
            >
                <Header />
                {(isLoggedIn ||
                    projectIdRemapped ===
                        DEMO_WORKSPACE_PROXY_APPLICATION_ID) && <Sidebar />}
                <div
                    className={classNames(commonStyles.bodyWrapper, {
                        [commonStyles.bannerShown]: showBanner,
                    })}
                >
                    {/* Edge case: shareable links will still direct to this error page if you are logged in on a different project */}
                    {isLoggedIn && (error || !data?.project) ? (
                        <ErrorState
                            message={`
                        Seems like you don’t have access to this page 😢. If you're
                        part of a team, ask your project admin to send you an
                        invite. Otherwise, feel free to make an account!
                        `}
                            errorString={
                                'ProjectRouter Error: ' + JSON.stringify(error)
                            }
                        />
                    ) : (
                        <>
                            {isLoggedIn && !hasFinishedOnboarding && (
                                <>
                                    <OnboardingBubble />
                                </>
                            )}
                            <ApplicationRouter integrated={integrated} />
                        </>
                    )}
                </div>
            </ApplicationContextProvider>
        </GlobalContextProvider>
    );
};
