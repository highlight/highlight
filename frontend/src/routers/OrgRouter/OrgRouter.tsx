import useLocalStorage from '@rehooks/local-storage';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import commonStyles from '../../Common.module.scss';
import { ErrorState } from '../../components/ErrorState/ErrorState';
import { Header } from '../../components/Header/Header';
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import {
    SidebarContextProvider,
    SidebarState,
} from '../../components/Sidebar/SidebarContext';
import {
    useGetOrganizationLazyQuery,
    useGetOrganizationsLazyQuery,
} from '../../graph/generated/hooks';
import { useIntegrated } from '../../util/integrated';
import ApplicationRouter from './ApplicationRouter';

export const OrgRouter = () => {
    const { organization_id: organizationIdFromSearchParams } = useParams<{
        organization_id: string;
    }>();
    const [organization_id, setOrganizationId] = useState(
        !isNaN(parseInt(organizationIdFromSearchParams, 10))
            ? organizationIdFromSearchParams
            : undefined
    );
    const history = useHistory();

    const [
        getOrganizationQuery,
        { loading, error, data },
    ] = useGetOrganizationLazyQuery();

    const [
        getOrganizationsQuery,
        { loading: o_loading, data: o_data },
    ] = useGetOrganizationsLazyQuery();

    const { integrated, loading: integratedLoading } = useIntegrated(
        parseInt(organization_id || '-1')
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

    // Checks if the URL has an organization ID.
    // 1. If it does then handle routing normally.
    // 2. If it doesn't then find the user's default organization and set that as the current organization.
    useEffect(() => {
        if (organization_id && !isNaN(parseInt(organization_id, 10))) {
            getOrganizationQuery({ variables: { id: organization_id } });
        } else {
            getOrganizationsQuery();
        }
    }, [getOrganizationQuery, getOrganizationsQuery, organization_id]);

    // Redirects the user to their default organization when the URL does not have an organization ID.
    // For example, this allows linking to https://app.highlight.run/sessions for https://app.highlight.run/1/sessions
    useEffect(() => {
        if (
            !o_loading &&
            !!o_data?.organizations?.length &&
            o_data.organizations.length > 0
        ) {
            const defaultOrganizationIdForUser = o_data.organizations[0]!.id;
            setOrganizationId(defaultOrganizationIdForUser);

            history.replace(
                `/${defaultOrganizationIdForUser}${history.location.pathname}`
            );
        }
    }, [history, o_data?.organizations, o_loading]);

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
