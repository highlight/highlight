import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from './components/Spinner/Spinner';
import { Header } from './components/Header/Header';
import { Switch, Route } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Player } from './pages/Player/PlayerPage';
import { SessionsPage } from './pages/Sessions/SessionsPage';
import { WorkspaceTeam } from './pages/WorkspaceTeam/WorkspaceTeam';
import { SetupPage } from './pages/Setup/SetupPage';
import { useIntegrated } from './util/integrated';
import styles from './App.module.css';
import { WorkspaceSettings } from './pages/WorkspaceSettings/WorkspaceSettings';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SidebarContext } from './components/Sidebar/SidebarContext';

import commonStyles from './Common.module.css';

export const OrgRouter = () => {
    const { organization_id } = useParams();
    const { loading, error, data } = useQuery<
        { organization: { name: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                }
            }
        `,
        { variables: { id: organization_id } }
    );
    const { integrated, loading: integratedLoading } = useIntegrated(
        organization_id
    );
    const [openSidebar, setOpenSidebar] = useState(false);

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
            <Header />
            <div className={commonStyles.bodyWrapper}>
                <Sidebar />
                <Switch>
                    <Route path="/:organization_id/sessions/:session_id">
                        <Player />
                    </Route>
                    <Route path="/:organization_id/sessions">
                        <SessionsPage integrated={integrated} />
                    </Route>
                    <Route path="/:organization_id/settings">
                        <WorkspaceSettings />
                    </Route>
                    <Route path="/:organization_id/team">
                        <WorkspaceTeam />
                    </Route>
                    <Route path="/:organization_id">
                        <SetupPage integrated={integrated} />
                    </Route>
                </Switch>
            </div>
        </SidebarContext.Provider>
    );
};
