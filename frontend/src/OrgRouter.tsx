import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Spinner } from './components/Spinner/Spinner';
import { Header } from './components/Header/Header';
import { Switch, Route } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Player } from './pages/Player/PlayerPage';
import { SessionsPage } from './pages/Sessions/SessionsPage';
import { WorkspaceTeam } from './pages/WorkspaceTeam/WorkspaceTeam';
import { Billing } from './pages/Billing/Billing';
import { SetupPage } from './pages/Setup/SetupPage';
import { useIntegrated } from './util/integrated';
import styles from './App.module.scss';
import { WorkspaceSettings } from './pages/WorkspaceSettings/WorkspaceSettings';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SidebarContext } from './components/Sidebar/SidebarContext';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';

import commonStyles from './Common.module.scss';
import { SessionsPageBeta } from './pages/Sessions/SessionsPageBeta';
import { Duration, MillisToDaysHoursMinSeconds } from './util/time';

export const OrgRouter = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [trialTimeRemaining, setTrialTimeRemaining] = useState<Duration | undefined>(undefined)
    const { loading, error, data } = useQuery<
        { organization: { name: string; trial_end_date: number } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    id
                    name
                    trial_end_date
                }
            }
        `,
        { variables: { id: parseInt(organization_id) } }
    );

    const { integrated, loading: integratedLoading } = useIntegrated(
        parseInt(organization_id)
    );
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const diff =
            new Date(data?.organization.trial_end_date ?? 0).valueOf() -
            Date.now().valueOf();
        const trialTimeRemaining = diff > 0 ? MillisToDaysHoursMinSeconds(diff) : undefined;
        setTrialTimeRemaining(trialTimeRemaining);
    }, [data])

    if (error) {
        return <p>{'OrgValidator error: ' + JSON.stringify(error)}</p>;
    }
    if (integratedLoading || loading || !data?.organization) {
        return (
            <div className={styles.loadingWrapper}>
                <Spinner />
            </div>
        );
    }
    return (
        <SidebarContext.Provider value={{ openSidebar, setOpenSidebar }}>
            <Header trialTimeRemaining={trialTimeRemaining} />
            <div className={commonStyles.bodyWrapper}>
                <Sidebar />
                <Switch>
                    <Route path="/:organization_id/sessions/segment/:segment_id">
                        <SessionsPageBeta integrated={integrated} />
                    </Route>
                    <Route path="/:organization_id/sessions/:session_id">
                        <Player />
                    </Route>
                    <Route path="/:organization_id/sessions">
                        <SessionsPageBeta integrated={integrated} />
                    </Route>
                    <Route path="/:organization_id/sessions-old">
                        <SessionsPage integrated={integrated} />
                    </Route>
                    <Route path="/:organization_id/settings">
                        <WorkspaceSettings />
                    </Route>
                    <Route path="/:organization_id/team">
                        <WorkspaceTeam />
                    </Route>
                    <Route path="/:organization_id/billing">
                        <Billing />
                    </Route>
                    <Route path="/:organization_id/setup">
                        <SetupPage integrated={integrated} />
                    </Route>
                    <Route path="/:organization_id">
                        {integrated ? <Redirect to={`/${organization_id}/sessions`} /> :
                            <Redirect to={`/${organization_id}/setup`} />
                        }
                    </Route>
                </Switch>
            </div>
        </SidebarContext.Provider >
    );
};