import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingPage } from '../../components/Loading/Loading';
import { Header } from '../../components/Header/Header';
import { useIntegrated } from '../../util/integrated';
import { Sidebar } from '../../components/Sidebar/Sidebar';

import commonStyles from '../../Common.module.scss';
import { useGetOrganizationQuery } from '../../graph/generated/hooks';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import ApplicationRouter from './ApplicationRouter';
import {
    SidebarContextProvider,
    SidebarState,
} from '../../components/Sidebar/SidebarContext';
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble';
import useLocalStorage from '@rehooks/local-storage';

export const OrgRouter = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { loading, error, data } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });

    const { integrated, loading: integratedLoading } = useIntegrated(
        parseInt(organization_id)
    );
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
            case SidebarState.TemporarilyExpanded:
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
        return <LoadingPage />;
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
                {error || !data?.organization ? (
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
