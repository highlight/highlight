import KeyboardShortcutsEducation from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import _ from 'lodash';
import React, { Suspense, useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
    BooleanParam,
    JsonParam,
    StringParam,
    useQueryParam,
    useQueryParams,
} from 'use-query-params';

import AlertsPage from '../../pages/Alerts/Alerts';
const BillingPage = React.lazy(() => import('../../pages/Billing/Billing'));

const Buttons = React.lazy(() => import('../../pages/Buttons/Buttons'));
import ErrorPage from '../../pages/Error/ErrorPage';
import HomePage from '../../pages/Home/HomePage';
import Player from '../../pages/Player/PlayerPage';
import { EmptySessionsSearchParams } from '../../pages/Sessions/EmptySessionsSearchParams';
import {
    SearchContextProvider,
    SearchParams,
} from '../../pages/Sessions/SearchContext/SearchContext';
import SetupPage from '../../pages/Setup/SetupPage';
import WorkspaceSettings from '../../pages/WorkspaceSettings/WorkspaceSettings';
import WorkspaceTeam from '../../pages/WorkspaceTeam/WorkspaceTeam';

interface Props {
    integrated: boolean;
}

const ApplicationRouter = ({ integrated }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [showStarredSessions, setShowStarredSessions] = useState<boolean>(
        false
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );
    const [selectedSegment, setSelectedSegment] = useLocalStorage<
        { value: string; id: string } | undefined
    >(
        `highlightSegmentPickerForPlayerSelectedSegmentId-${project_id}`,
        undefined
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
    const [activeSegmentUrlParam, setActiveSegmentUrlParam] = useQueryParam(
        'segment',
        JsonParam
    );

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

    // Session Segment Deep Linking
    useEffect(() => {
        if (selectedSegment && selectedSegment.id && selectedSegment.value) {
            setActiveSegmentUrlParam(selectedSegment);
        } else {
            setActiveSegmentUrlParam(undefined);
        }
    }, [selectedSegment, setActiveSegmentUrlParam]);

    useEffect(() => {
        if (activeSegmentUrlParam) {
            setSelectedSegment(activeSegmentUrlParam);
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
                selectedSegment,
                setSelectedSegment,
            }}
        >
            <KeyboardShortcutsEducation />
            <Switch>
                <Route path="/:project_id/sessions/:session_id?" exact>
                    <Player integrated={integrated} />
                </Route>
                <Route path="/:project_id/settings">
                    <WorkspaceSettings />
                </Route>
                <Route path="/:project_id/alerts">
                    <AlertsPage />
                </Route>
                <Route path="/:project_id/team">
                    <WorkspaceTeam />
                </Route>
                <Route path="/:project_id/billing">
                    <Suspense fallback={null}>
                        <BillingPage />
                    </Suspense>
                </Route>
                <Route path="/:project_id/setup">
                    <SetupPage integrated={integrated} />
                </Route>
                <Route path="/:project_id/errors/:error_id?">
                    <ErrorPage integrated={integrated} />
                </Route>
                <Route path="/:project_id/buttons">
                    <Suspense fallback={null}>
                        <Buttons />
                    </Suspense>
                </Route>
                <Route path="/:project_id/home">
                    <HomePage />
                </Route>
                <Route path="/:project_id">
                    {integrated ? (
                        <Redirect to={`/${project_id}/home`} />
                    ) : (
                        <Redirect to={`/${project_id}/setup`} />
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
