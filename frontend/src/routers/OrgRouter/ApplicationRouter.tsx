import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';
import {
    BooleanParam,
    JsonParam,
    StringParam,
    useQueryParams,
} from 'use-query-params';

import AlertsPage from '../../pages/Alerts/Alerts';
import BillingPage from '../../pages/Billing/Billing';
import { Buttons } from '../../pages/Buttons/Buttons';
import ErrorPage from '../../pages/Error/ErrorPage';
import HomePage from '../../pages/Home/HomePage';
import Player from '../../pages/Player/PlayerPage';
import {
    SearchContextProvider,
    SearchParams,
} from '../../pages/Sessions/SearchContext/SearchContext';
import { EmptySessionsSearchParams } from '../../pages/Sessions/SessionsPage';
import SetupPage from '../../pages/Setup/SetupPage';
import WorkspaceSettings from '../../pages/WorkspaceSettings/WorkspaceSettings';
import WorkspaceTeam from '../../pages/WorkspaceTeam/WorkspaceTeam';

interface Props {
    integrated: boolean;
}

const ApplicationRouter = ({ integrated }: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [showStarredSessions, setShowStarredSessions] = useState<boolean>(
        false
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );
    const [
        searchParamsToUrlParams,
        setSearchParamsToUrlParams,
    ] = useQueryParams({
        user_properties: JsonParam,
        identified: BooleanParam,
        browser: StringParam,
        date_range: JsonParam,
        excluded_properties: JsonParam,
        hide_viewed: BooleanParam,
        length_range: JsonParam,
        os: StringParam,
        referrer: StringParam,
        track_properties: JsonParam,
        excluded_track_properties: JsonParam,
        visited_url: StringParam,
        first_time: BooleanParam,
        device_id: StringParam,
        show_live_sessions: BooleanParam,
    });

    const [existingParams, setExistingParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );

    useEffect(() => {
        const areAnySearchParamsSet = !_.isEqual(
            EmptySessionsSearchParams,
            searchParams
        );

        // Handles the case where the user is loading the page from a link shared from another user that has search params in the URL.
        if (!segmentName && areAnySearchParamsSet) {
            // `undefined` values will not be persisted to the URL.
            // Because of that, we only want to change the values from `undefined`
            // to the actual value when the value is different to the empty state.
            const searchParamsToReflectInUrl = { ...InitialSearchParamsForUrl };
            Object.keys(searchParams).forEach((key) => {
                // @ts-expect-error
                const currentSearchParam = searchParams[key];
                // @ts-expect-error
                const emptySearchParam = EmptySessionsSearchParams[key];
                if (Array.isArray(currentSearchParam)) {
                    if (currentSearchParam.length !== emptySearchParam.length) {
                        // @ts-expect-error
                        searchParamsToReflectInUrl[key] = currentSearchParam;
                    }
                } else if (currentSearchParam !== emptySearchParam) {
                    // @ts-expect-error
                    searchParamsToReflectInUrl[key] = currentSearchParam;
                }
            });

            setSearchParamsToUrlParams({
                ...searchParamsToReflectInUrl,
            });
        }
    }, [setSearchParamsToUrlParams, searchParams, segmentName]);

    useEffect(() => {
        if (!_.isEqual(InitialSearchParamsForUrl, searchParamsToUrlParams)) {
            setSearchParams(searchParamsToUrlParams as SearchParams);
        }
        // We only want to run this on mount (i.e. when the page first loads).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SearchContextProvider
            value={{
                searchParams,
                setSearchParams,
                existingParams,
                setExistingParams,
                segmentName,
                setSegmentName,
                showStarredSessions,
                setShowStarredSessions,
            }}
        >
            <Switch>
                <Route path="/:organization_id/sessions/:session_id?" exact>
                    <Player />
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
                <Route path="/:organization_id/errors/:error_id?">
                    <ErrorPage integrated={integrated} />
                </Route>
                <Route path="/:organization_id/buttons">
                    <Buttons />
                </Route>
                <Route path="/:organization_id/home">
                    <HomePage />
                </Route>
                <Route path="/:organization_id">
                    {integrated ? (
                        <Redirect to={`/${organization_id}/home`} />
                    ) : (
                        <Redirect to={`/${organization_id}/setup`} />
                    )}
                </Route>
            </Switch>
        </SearchContextProvider>
    );
};

export default ApplicationRouter;

const InitialSearchParamsForUrl = {
    browser: undefined,
    date_range: undefined,
    device_id: undefined,
    excluded_properties: undefined,
    excluded_track_properties: undefined,
    first_time: undefined,
    hide_viewed: undefined,
    identified: undefined,
    length_range: undefined,
    os: undefined,
    referrer: undefined,
    track_properties: undefined,
    user_properties: undefined,
    visited_url: undefined,
    show_live_sessions: undefined,
};
