import useLocalStorage from '@rehooks/local-storage';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../AuthContext';
import commonStyles from '../../Common.module.scss';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { Header } from '../../components/Header/Header';
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import {
    SidebarContextProvider,
    SidebarState,
} from '../../components/Sidebar/SidebarContext';
import { useGetOrganizationQuery } from '../../graph/generated/hooks';
import { useIntegrated } from '../../util/integrated';
import ApplicationRouter from './ApplicationRouter';

export const OrgRouter = () => {
    const { isLoggedIn } = useAuthContext();
    const { organization_id } = useParams<{
        organization_id: string;
    }>();

    const { loading, error, data } = useGetOrganizationQuery({
        variables: { id: organization_id },
        skip: !isLoggedIn, // Higher level routers decide when guests are allowed to hit this router
    });

    const { integrated, loading: integratedLoading } = useIntegrated();
    const [sidebarState, setSidebarState] = useState<SidebarState>(
        SidebarState.Collapsed
    );
    const [hasFinishedOnboarding] = useLocalStorage(
        `highlight-finished-onboarding-${organization_id}`,
        false
    );

    const toggleSidebar = () => {
        let nextState;

        switch (sidebarState) {
            case SidebarState.Collapsed:
                nextState = SidebarState.Expanded;
                break;
            case SidebarState.Expanded:
                nextState = SidebarState.Collapsed;
                break;
            default:
                nextState = SidebarState.Collapsed;
                break;
        }

        setSidebarState(nextState);
    };

    useEffect(() => {
        window.Intercom('update', {
            hide_default_launcher: true,
        });
        return () => {
            window.Intercom('update', {
                hide_default_launcher: false,
            });
        };
    }, []);

    if (integratedLoading || loading) {
        return null;
    }
    return (
        <SidebarContextProvider
            value={{
                setState: setSidebarState,
                state: sidebarState,
                toggleSidebar,
            }}
        >
            <Header />
            <div className={commonStyles.bodyWrapper}>
                {/* Edge case: shareable links will still direct to this error page if you are logged in on a different org */}
                {isLoggedIn && (error || !data?.organization) ? (
                    <ErrorState
                        message={`
                        Seems like you don’t have access to this page 😢. If you're
                        part of a team, ask your workspace admin to send you an
                        invite. Otherwise, feel free to make an account!
                        `}
                        errorString={
                            'OrgRouter Error: ' + JSON.stringify(error)
                        }
                    />
                ) : (
                    <>
                        <Sidebar />
                        {!hasFinishedOnboarding && <OnboardingBubble />}
                        <ApplicationRouter integrated={integrated} />
                    </>
                )}
            </div>
        </SidebarContextProvider>
    );
};
