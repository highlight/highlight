import { useAuthContext } from '@authentication/AuthContext';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { ErrorState } from '@components/ErrorState/ErrorState';
import { Header } from '@components/Header/Header';
import { Sidebar } from '@components/Sidebar/Sidebar';
import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useGetProjectDropdownOptionsQuery } from '@graph/hooks';
import { EmptySessionsSearchParams } from '@pages/Sessions/EmptySessionsSearchParams';
import {
    QueryBuilderInput,
    SearchContextProvider,
    SearchParams,
} from '@pages/Sessions/SearchContext/SearchContext';
import useLocalStorage from '@rehooks/local-storage';
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext';
import { useIntegrated } from '@util/integrated';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import { FieldArrayParam, QueryBuilderStateParam } from '@util/url/params';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useToggle } from 'react-use';
import {
    ArrayParam,
    BooleanParam,
    JsonParam,
    StringParam,
    useQueryParam,
    useQueryParams,
} from 'use-query-params';

import commonStyles from '../../Common.module.scss';
import OnboardingBubble from '../../components/OnboardingBubble/OnboardingBubble';
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
    const { setLoadingState } = useAppLoadingContext();

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
        if (data?.workspace?.id) {
            window.Intercom('update', {
                company: {
                    id: data?.workspace.id,
                    name: data?.workspace.name,
                },
            });
            window.rudderanalytics.group(data?.workspace.id, {
                name: data?.workspace.name,
            });
        }
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
            setLoadingState((previousLoadingState) => {
                if (previousLoadingState !== AppLoadingState.EXTENDED_LOADING) {
                    return loading || integratedLoading
                        ? AppLoadingState.LOADING
                        : AppLoadingState.LOADED;
                }

                return AppLoadingState.EXTENDED_LOADING;
            });
        } else {
            setLoadingState(AppLoadingState.LOADED);
        }
    }, [error, integratedLoading, loading, setLoadingState]);

    // Params and hooks for SearchContextProvider

    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [showStarredSessions, setShowStarredSessions] = useState<boolean>(
        false
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );
    const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

    const [selectedSegment, setSelectedSegment] = useLocalStorage<
        { value: string; id: string } | undefined
    >(
        `highlightSegmentPickerForPlayerSelectedSegmentId-${project_id}`,
        undefined
    );

    const [searchQuery, setSearchQuery] = useState('');

    const [
        queryBuilderInput,
        setQueryBuilderInput,
    ] = useState<QueryBuilderInput>(undefined);

    const [
        searchParamsToUrlParams,
        setSearchParamsToUrlParams,
    ] = useQueryParams({
        user_properties: FieldArrayParam,
        identified: BooleanParam,
        browser: StringParam,
        date_range: JsonParam,
        excluded_properties: FieldArrayParam,
        hide_viewed: BooleanParam,
        length_range: JsonParam,
        os: StringParam,
        referrer: StringParam,
        track_properties: FieldArrayParam,
        excluded_track_properties: FieldArrayParam,
        visited_url: StringParam,
        first_time: BooleanParam,
        device_id: StringParam,
        show_live_sessions: BooleanParam,
        environments: ArrayParam,
        app_versions: ArrayParam,
        query: QueryBuilderStateParam,
    });
    const [activeSegmentUrlParam, setActiveSegmentUrlParam] = useQueryParam(
        'segment',
        JsonParam
    );

    const [existingParams, setExistingParams] = useState<SearchParams>(
        EmptySessionsSearchParams
    );

    const sessionsMatch = useRouteMatch('/:project_id/sessions');

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

            // Only do this on the session page.
            // We don't do this on other pages because we use search params to represent state
            // For example, on the /alerts page we use `code` to store the Slack code when the OAuth redirect.
            // If we run this, it'll remove the code and the integration will fail.
            if (sessionsMatch) {
                setSearchParamsToUrlParams(
                    {
                        ...searchParamsToReflectInUrl,
                    },
                    'replaceIn'
                );
            }
        }
    }, [setSearchParamsToUrlParams, searchParams, segmentName, sessionsMatch]);

    useEffect(() => {
        if (!_.isEqual(InitialSearchParamsForUrl, searchParamsToUrlParams)) {
            setSearchParams(searchParamsToUrlParams as SearchParams);
        }
        // We only want to run this on mount (i.e. when the page first loads).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Session Segment Deep Linking
    useEffect(() => {
        // Only this effect on the sessions page
        if (!sessionsMatch) {
            return;
        }

        if (selectedSegment && selectedSegment.id && selectedSegment.value) {
            if (!_.isEqual(activeSegmentUrlParam, selectedSegment)) {
                setActiveSegmentUrlParam(selectedSegment, 'replace');
            }
        } else if (activeSegmentUrlParam !== undefined) {
            setActiveSegmentUrlParam(undefined, 'replace');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSegment, sessionsMatch, setActiveSegmentUrlParam]);

    useEffect(() => {
        if (activeSegmentUrlParam) {
            setSelectedSegment(activeSegmentUrlParam);
        }
        // We only want to run this on mount (i.e. when the page first loads).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        searchQuery,
                        setSearchQuery,
                        queryBuilderInput,
                        setQueryBuilderInput,
                        isQuickSearchOpen,
                        setIsQuickSearchOpen,
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
                                    'ProjectRouter Error: ' +
                                    JSON.stringify(error)
                                }
                                shownWithHeader
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
                </SearchContextProvider>
            </ApplicationContextProvider>
        </GlobalContextProvider>
    );
};

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
    environments: undefined,
    app_versions: undefined,
};
