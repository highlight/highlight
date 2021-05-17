import loadable from '@loadable/component';
import React, { useState } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import { Buttons } from '../../pages/Buttons/Buttons';
import { PlayerBETA } from '../../pages/Player/PlayerPage';
import {
    SearchContextProvider,
    SearchParams,
} from '../../pages/Sessions/SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../../pages/Sessions/SessionsPage';

interface Props {
    integrated: boolean;
}

const SessionsPage = loadable(
    () => import('../../pages/Sessions/SessionsPage')
);
const Player = loadable(() => import('../../pages/Player/PlayerPage'));
const WorkspaceSettings = loadable(
    () => import('../../pages/WorkspaceSettings/WorkspaceSettings')
);
const AlertsPage = loadable(() => import('../../pages/Alerts/Alerts'));
const ErrorPage = loadable(() => import('../../pages/Error/ErrorPage'));
const ErrorsPage = loadable(() => import('../../pages/Errors/ErrorsPage'));
const HomePage = loadable(() => import('../../pages/Home/HomePage'));
const SetupPage = loadable(() => import('../../pages/Setup/SetupPage'));
const WorkspaceTeam = loadable(
    () => import('../../pages/WorkspaceTeam/WorkspaceTeam')
);
const BillingPage = loadable(() => import('../../pages/Billing/Billing'));

const ApplicationRouter = ({ integrated }: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );
    const [existingParams, setExistingParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );
    const [hideLiveSessions, setHideLiveSessions] = useState<boolean>(false);

    return (
        <SearchContextProvider
            value={{
                searchParams,
                setSearchParams,
                existingParams,
                setExistingParams,
                segmentName,
                setSegmentName,
                hideLiveSessions,
                setHideLiveSessions,
            }}
        >
            <Switch>
                <Route
                    path="/:organization_id/sessions/segment/:segment_id"
                    exact
                >
                    <SessionsPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/sessions/2" exact>
                    <PlayerBETA />
                </Route>
                <Route path="/:organization_id/sessions/:session_id" exact>
                    <Player />
                </Route>
                <Route path="/:organization_id/sessions" exact>
                    <SessionsPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/settings">
                    <WorkspaceSettings />
                </Route>
                <Route path="/:organization_id/alerts">
                    <AlertsPage />
                </Route>
                <Route path="/:organization_id/team">
                    <WorkspaceTeam />
                </Route>
                <Route path="/:organization_id/billing">
                    <BillingPage />
                </Route>
                <Route path="/:organization_id/setup">
                    <SetupPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/errors/segment/:segment_id">
                    <ErrorsPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/errors/:error_id">
                    <ErrorPage />
                </Route>
                <Route path="/:organization_id/errors">
                    <ErrorsPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/buttons">
                    <Buttons />
                </Route>
                <Route path="/:organization_id/home">
                    <HomePage />
                </Route>
                <Route path="/:organization_id">
                    {integrated ? (
                        <Redirect to={`/${organization_id}/sessions`} />
                    ) : (
                        <Redirect to={`/${organization_id}/setup`} />
                    )}
                </Route>
            </Switch>
        </SearchContextProvider>
    );
};

export default ApplicationRouter;
