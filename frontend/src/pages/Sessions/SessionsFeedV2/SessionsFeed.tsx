import { isOnPrem } from '@util/onPrem/onPremUtils';
import { useParams } from '@util/react-router/useParams';
import React, { RefObject, useEffect, useMemo, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import TextTransition from 'react-text-transition';
import { useSessionStorage } from 'react-use';

import { SearchEmptyState } from '../../../components/SearchEmptyState/SearchEmptyState';
import Switch from '../../../components/Switch/Switch';
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard';
import { useGetSessionsQuery } from '../../../graph/generated/hooks';
import { SessionLifecycle } from '../../../graph/generated/schemas';
import { formatNumberWithDelimiters } from '../../../util/numbers';
import usePlayerConfiguration from '../../Player/PlayerHook/utils/usePlayerConfiguration';
import { useReplayerContext } from '../../Player/ReplayerContext';
import { useSearchContext } from '../SearchContext/SearchContext';
import { LIVE_SEGMENT_ID } from '../SearchSidebar/SegmentPicker/SegmentPicker';
import MinimalSessionCard from './components/MinimalSessionCard/MinimalSessionCard';
import styles from './SessionsFeed.module.scss';

// const SESSIONS_FEED_POLL_INTERVAL = 1000 * 10;

export const SessionFeed = React.memo(() => {
    const { setSessionResults, sessionResults } = useReplayerContext();
    const { project_id, segment_id, session_secure_id } = useParams<{
        project_id: string;
        segment_id: string;
        session_secure_id: string;
    }>();
    const [count, setCount] = useState(10);
    const {
        autoPlaySessions,
        setAutoPlaySessions,
        setShowDetailedSessionView,
        showDetailedSessionView,
    } = usePlayerConfiguration();

    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const { searchParams, showStarredSessions } = useSearchContext();
    const { show_live_sessions } = searchParams;
    const [isIntegrating] = useSessionStorage(
        `highlight-isIntegrating-${project_id}`,
        false
    );

    const { loading, fetchMore, called } = useGetSessionsQuery({
        variables: {
            params: searchParams,
            count: count + 10,
            project_id,
            lifecycle:
                segment_id === LIVE_SEGMENT_ID
                    ? SessionLifecycle.Live
                    : show_live_sessions || isIntegrating
                    ? SessionLifecycle.Live
                    : SessionLifecycle.Completed,
            starred: showStarredSessions,
        },
        // pollInterval: SESSIONS_FEED_POLL_INTERVAL,
        onCompleted: (response) => {
            if (response.sessions) {
                setSessionResults(response.sessions);
            }
            setShowLoadingSkeleton(false);
        },
    });

    useEffect(() => {
        setShowLoadingSkeleton(true);
    }, [searchParams]);

    const infiniteRef = useInfiniteScroll({
        checkInterval: 1200, // frequency to check (1.2s)
        loading,
        hasNextPage: sessionResults.sessions.length < sessionResults.totalCount,
        scrollContainer: 'parent',
        onLoadMore: () => {
            setCount((previousCount) => previousCount + 10);
            fetchMore({
                variables: {
                    params: searchParams,
                    count,
                    project_id,
                    processed:
                        segment_id === LIVE_SEGMENT_ID
                            ? SessionLifecycle.Live
                            : searchParams.show_live_sessions
                            ? SessionLifecycle.Live
                            : SessionLifecycle.Completed,
                },
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

    return (
        <>
            <div className={styles.fixedContent}>
                <div className={styles.resultCount}>
                    {sessionResults.totalCount === -1 ? (
                        <Skeleton width="100px" />
                    ) : (
                        sessionResults.totalCount > 0 && (
                            <div className={styles.resultCountValueContainer}>
                                <span>
                                    <TextTransition
                                        inline
                                        text={`${formatNumberWithDelimiters(
                                            sessionResults.totalCount
                                        )}`}
                                    />{' '}
                                    sessions
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
                                        label="Show Details"
                                        checked={showDetailedSessionView}
                                        onChange={(checked) => {
                                            setShowDetailedSessionView(checked);
                                        }}
                                        trackingId="SessionFeedShowDetails"
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className={styles.feedContent}>
                <div ref={infiniteRef as RefObject<HTMLDivElement>}>
                    {loading && showLoadingSkeleton ? (
                        <Skeleton
                            height={74}
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
                                <SearchEmptyState item={'sessions'} newFeed />
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
                                        />
                                    ))}
                                </>
                            )}
                            {sessionResults.sessions.length <
                                sessionResults.totalCount && (
                                <Skeleton
                                    height={74}
                                    style={{
                                        borderRadius: 8,
                                        marginBottom: 24,
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
});
