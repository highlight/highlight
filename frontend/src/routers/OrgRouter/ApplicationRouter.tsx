import React, { useState } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import { AlertsPage } from '../../pages/Alerts/Alerts';
import { Billing } from '../../pages/Billing/Billing';
import { Buttons } from '../../pages/Buttons/Buttons';
import { ErrorPage } from '../../pages/Error/ErrorPage';
import { ErrorsPage } from '../../pages/Errors/ErrorsPage';
import { HomePage } from '../../pages/Home/HomePage';
import { Player } from '../../pages/Player/PlayerPage';
import {
    SearchContextProvider,
    SearchParams,
} from '../../pages/Sessions/SearchContext/SearchContext';
import {
    EmptySessionsSearchParams,
    SessionsPage,
} from '../../pages/Sessions/SessionsPage';
import { SetupPage } from '../../pages/Setup/SetupPage';
import { WorkspaceSettings } from '../../pages/WorkspaceSettings/WorkspaceSettings';
import { WorkspaceTeam } from '../../pages/WorkspaceTeam/WorkspaceTeam';

interface Props {
    integrated: boolean;
}

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
                    <Billing />
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
