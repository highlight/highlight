import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState';
import Tooltip from '@components/Tooltip/Tooltip';
import {
    useGetBillingDetailsForProjectQuery,
    useGetSessionsOpenSearchQuery,
    useGetSessionsQuery,
    useUnprocessedSessionsCountQuery,
} from '@graph/hooks';
import {
    GetSessionsOpenSearchQuery,
    GetSessionsQuery,
} from '@graph/operations';
import { PlanType, SessionLifecycle } from '@graph/schemas';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { QueryBuilderState } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import { getUnprocessedSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/utils/utils';
import SessionFeedConfiguration, {
    formatCount,
} from '@pages/Sessions/SessionsFeedV2/components/SessionFeedConfiguration/SessionFeedConfiguration';
import { SessionFeedConfigurationContextProvider } from '@pages/Sessions/SessionsFeedV2/context/SessionFeedConfigurationContext';
import { useSessionFeedConfiguration } from '@pages/Sessions/SessionsFeedV2/hooks/useSessionFeedConfiguration';
import { useIntegrated } from '@util/integrated';
import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import TextTransition from 'react-text-transition';

import Switch from '../../../components/Switch/Switch';
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard';
import usePlayerConfiguration from '../../Player/PlayerHook/utils/usePlayerConfiguration';
import { useReplayerContext } from '../../Player/ReplayerContext';
import {
    showLiveSessions,
    useSearchContext,
} from '../SearchContext/SearchContext';
import { LIVE_SEGMENT_ID } from '../SearchSidebar/SegmentPicker/SegmentPicker';
import MinimalSessionCard from './components/MinimalSessionCard/MinimalSessionCard';
import styles from './SessionsFeed.module.scss';

// const SESSIONS_FEED_POLL_INTERVAL = 1000 * 10;
const PAGE_SIZE = 20;

export const SessionFeed = React.memo(() => {
    const { setSessionResults, sessionResults } = useReplayerContext();
    const { project_id, segment_id, session_secure_id } = useParams<{
        project_id: string;
        segment_id: string;
        session_secure_id: string;
    }>();
    const sessionFeedConfiguration = useSessionFeedConfiguration();
    const {
        autoPlaySessions,
        setAutoPlaySessions,
        setShowDetailedSessionView,
        showDetailedSessionView,
    } = usePlayerConfiguration();
    const { isQueryBuilder } = usePlayerUIContext();

    const [
        sessionFeedIsInTopScrollPosition,
        setSessionFeedIsInTopScrollPosition,
    ] = useState(true);

    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const {
        searchParams,
        showStarredSessions,
        setSearchParams,
        searchQuery,
        page,
        setPage,
    } = useSearchContext();
    const { show_live_sessions } = searchParams;
    const { integrated } = useIntegrated();

    const { data: billingDetails } = useGetBillingDetailsForProjectQuery({
        variables: { project_id },
    });
    const { data: unprocessedSessionsSql } = useUnprocessedSessionsCountQuery({
        variables: {
            project_id,
        },
        pollInterval: 5000,
        skip: isQueryBuilder,
    });

    const {
        data: unprocessedSessionsOpenSearch,
    } = useGetSessionsOpenSearchQuery({
        variables: {
            project_id,
            count: 0, // Don't need any results, just the count
            query: getUnprocessedSessionsQuery(searchQuery),
            sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
        },
        skip: !isQueryBuilder || !searchQuery,
        pollInterval: 5000,
    });

    // Get the unprocessedSessionsCount from either the SQL or OpenSearch query
    const unprocessedSessionsCount: number | undefined = isQueryBuilder
        ? unprocessedSessionsOpenSearch?.sessions_opensearch.totalCount
        : unprocessedSessionsSql?.unprocessedSessionsCount;

    const addOpenSearchSessions = (response: GetSessionsOpenSearchQuery) => {
        if (response?.sessions_opensearch) {
            setSessionResults((r) => ({
                ...response.sessions_opensearch,
                sessions: [
                    ...r.sessions,
                    ...response.sessions_opensearch.sessions,
                ],
            }));
        }
        if (response?.sessions_opensearch?.scrollID) {
            setPage(response?.sessions_opensearch?.scrollID);
        }
        setShowLoadingSkeleton(false);
    };

    const addSessions = (response: GetSessionsQuery) => {
        if (response?.sessions) {
            setSessionResults((r) => ({
                ...response.sessions,
                sessions: [...r.sessions, ...response.sessions.sessions],
            }));
        }
        setPage((p) => ((Number.isInteger(p) ? Number(p) : 0) + 1).toString());
        setShowLoadingSkeleton(false);
    };

    const {
        loading: loadingOpenSearch,
        fetchMore: fetchOpenSearch,
        called: calledOpenSearch,
    } = useGetSessionsOpenSearchQuery({
        variables: {
            query: searchQuery,
            count: PAGE_SIZE,
            project_id,
            sort_desc: sessionFeedConfiguration.sortOrder === 'Descending',
        },
        onCompleted: addOpenSearchSessions,
        skip: !isQueryBuilder || !searchQuery,
    });

    const {
        loading: loadingOriginal,
        fetchMore: fetchOriginal,
        called: calledOriginal,
    } = useGetSessionsQuery({
        variables: {
            params: searchParams,
            count: PAGE_SIZE,
            project_id,
            page: Number.isInteger(page) ? Number(page) : 0,
            lifecycle:
                segment_id === LIVE_SEGMENT_ID
                    ? SessionLifecycle.All
                    : show_live_sessions
                    ? SessionLifecycle.All
                    : SessionLifecycle.Completed,
            starred: showStarredSessions,
        },
        // pollInterval: SESSIONS_FEED_POLL_INTERVAL,
        onCompleted: addSessions,
        skip: isQueryBuilder,
    });

    const called = isQueryBuilder ? calledOpenSearch : calledOriginal;
    const loading = isQueryBuilder ? loadingOpenSearch : loadingOriginal;
    const fetchMore = isQueryBuilder ? fetchOpenSearch : fetchOriginal;

    useEffect(() => {
        if (loading) {
            setShowLoadingSkeleton(true);
        }
        // Don't subscribe to loading. We only want to show the loading skeleton if changing the search params causing loading in a new set of sessions.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const enableLiveSessions = useCallback(() => {
        if (!searchParams.query) {
            setSearchParams({
                ...searchParams,
                show_live_sessions: true,
            });
        } else {
            // Replace any 'custom_processed' values with ['true', 'false']
            const processedRule = ['custom_processed', 'is', 'true', 'false'];
            const currentState = JSON.parse(
                searchParams.query
            ) as QueryBuilderState;
            const newRules = currentState.rules.map((rule) =>
                rule[0] === processedRule[0] ? processedRule : rule
            );
            setSearchParams({
                ...searchParams,
                query: JSON.stringify({
                    isAnd: currentState.isAnd,
                    rules: newRules,
                }),
            });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        // We're showing live sessions for new users.
        // The assumption here is if a project is on the free plan and the project has less than 15 sessions than there must be live sessions.
        // We show live sessions along with the processed sessions so the user isn't confused on why sessions are not showing up in the feed.
        if (
            billingDetails?.billingDetailsForProject &&
            integrated &&
            project_id !== DEMO_WORKSPACE_APPLICATION_ID &&
            project_id !== DEMO_WORKSPACE_PROXY_APPLICATION_ID &&
            !showLiveSessions(searchParams)
        ) {
            if (
                billingDetails.billingDetailsForProject.plan.type ===
                    PlanType.Free &&
                billingDetails.billingDetailsForProject.meter < 15
            ) {
                enableLiveSessions();
            }
        }
    }, [
        billingDetails?.billingDetailsForProject,
        enableLiveSessions,
        integrated,
        project_id,
        searchParams,
        setSearchParams,
    ]);

    const [sentryRef, { rootRef }] = useInfiniteScroll({
        loading,
        hasNextPage: sessionResults.sessions.length < sessionResults.totalCount,
        rootMargin: '-20px',
        delayInMs: 300,
        onLoadMore: () => {
            fetchMore({
                variables: {
                    params: searchParams,
                    count: PAGE_SIZE,
                    project_id,
                    scroll_id: page,
                    page: page,
                    processed:
                        segment_id === LIVE_SEGMENT_ID
                            ? SessionLifecycle.Live
                            : searchParams.show_live_sessions
                            ? SessionLifecycle.Live
                            : SessionLifecycle.Completed,
                },
            }).then((r) => {
                if (isQueryBuilder) {
                    addOpenSearchSessions(r.data as GetSessionsOpenSearchQuery);
                } else {
                    addSessions(r.data as GetSessionsQuery);
                }
            });
        },
    });

    const filteredSessions = useMemo(() => {
        if (loading) {
            return sessionResults.sessions;
        }
        if (searchParams.hide_viewed) {
            return sessionResults.sessions.filter(
                (session) => !session?.viewed
            );
        }
        return sessionResults.sessions;
    }, [loading, searchParams.hide_viewed, sessionResults.sessions]);

    const onFeedScrollListener = (
        e: React.UIEvent<HTMLElement> | undefined
    ) => {
        setSessionFeedIsInTopScrollPosition(e?.currentTarget.scrollTop === 0);
    };

    return (
        <SessionFeedConfigurationContextProvider
            value={sessionFeedConfiguration}
        >
            <div className={styles.fixedContent}>
                <div className={styles.resultCount}>
                    {sessionResults.totalCount === -1 ? (
                        <Skeleton width="100px" />
                    ) : (
                        <div className={styles.resultCountValueContainer}>
                            <span className={styles.countContainer}>
                                <Tooltip
                                    title={`${sessionResults.totalCount.toLocaleString()} sessions`}
                                >
                                    <TextTransition
                                        inline
                                        text={`${formatCount(
                                            sessionResults.totalCount,
                                            sessionFeedConfiguration.countFormat
                                        )}`}
                                    />{' '}
                                    {`sessions `}
                                </Tooltip>
                                {!!unprocessedSessionsCount &&
                                    unprocessedSessionsCount > 0 &&
                                    !showLiveSessions(searchParams) && (
                                        <button
                                            className={
                                                styles.liveSessionsCountButton
                                            }
                                            onClick={() => {
                                                message.success(
                                                    'Showing live sessions'
                                                );
                                                enableLiveSessions();
                                            }}
                                        >
                                            (
                                            {formatCount(
                                                unprocessedSessionsCount,
                                                sessionFeedConfiguration.countFormat
                                            )}{' '}
                                            live)
                                        </button>
                                    )}
                            </span>
                            <div className={styles.sessionFeedActions}>
                                <Switch
                                    label="Autoplay"
                                    checked={autoPlaySessions}
                                    onChange={(checked) => {
                                        setAutoPlaySessions(checked);
                                    }}
                                    trackingId="SessionFeedAutoplay"
                                />
                                <Switch
                                    label="Details"
                                    checked={showDetailedSessionView}
                                    onChange={(checked) => {
                                        setShowDetailedSessionView(checked);
                                    }}
                                    trackingId="SessionFeedShowDetails"
                                />
                                <SessionFeedConfiguration
                                    configuration={sessionFeedConfiguration}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div
                ref={rootRef}
                className={classNames(styles.feedContent, {
                    [styles.hasScrolled]: !sessionFeedIsInTopScrollPosition,
                })}
                onScroll={onFeedScrollListener}
            >
                <div onScroll={onFeedScrollListener}>
                    {showLoadingSkeleton ? (
                        <Skeleton
                            height={!showDetailedSessionView ? 74 : 125}
                            count={3}
                            style={{
                                borderRadius: 8,
                                marginBottom: 14,
                            }}
                        />
                    ) : (
                        <>
                            {!sessionResults.sessions.length &&
                            called &&
                            !loading ? (
                                showStarredSessions ? (
                                    <SearchEmptyState
                                        item={'sessions'}
                                        customTitle="Your project doesn't have starred sessions."
                                        customDescription="Starring a session is like bookmarking a website. It gives you a way to tag a session that you want to look at again. You can star a session by clicking the star icon next to the user details in the session's right panel."
                                    />
                                ) : (
                                    <SearchEmptyState item={'sessions'} />
                                )
                            ) : (
                                <>
                                    {!isOnPrem && <LimitedSessionCard />}
                                    {filteredSessions.map((u) => (
                                        <MinimalSessionCard
                                            session={u}
                                            key={u?.secure_id}
                                            selected={
                                                session_secure_id ===
                                                u?.secure_id
                                            }
                                            autoPlaySessions={autoPlaySessions}
                                            showDetailedSessionView={
                                                showDetailedSessionView
                                            }
                                            configuration={{
                                                countFormat:
                                                    sessionFeedConfiguration.countFormat,
                                                datetimeFormat:
                                                    sessionFeedConfiguration.datetimeFormat,
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                            <div ref={sentryRef} />
                            {loading ||
                                (sessionResults.sessions.length <
                                    sessionResults.totalCount && (
                                    <Skeleton
                                        height={74}
                                        style={{
                                            borderRadius: 8,
                                            marginBottom: 24,
                                        }}
                                    />
                                ))}
                        </>
                    )}
                </div>
            </div>
        </SessionFeedConfigurationContextProvider>
    );
});
