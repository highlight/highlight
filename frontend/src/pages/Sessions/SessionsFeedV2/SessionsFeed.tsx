import React, { RefObject, useEffect, useMemo, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { SearchEmptyState } from '../../../components/SearchEmptyState/SearchEmptyState';
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard';
import { useGetSessionsQuery } from '../../../graph/generated/hooks';
import {
    SessionLifecycle,
    SessionResults,
} from '../../../graph/generated/schemas';
import { formatNumberWithDelimiters } from '../../../util/numbers';
import { useSearchContext } from '../SearchContext/SearchContext';
import {
    LIVE_SEGMENT_ID,
    STARRED_SEGMENT_ID,
} from '../SearchSidebar/SegmentPicker/SegmentPicker';
import MinimalSessionCard from './components/MinimalSessionCard/MinimalSessionCard';
import styles from './SessionsFeed.module.scss';

const SESSIONS_FEED_POLL_INTERVAL = 5000;

export const SessionFeed = () => {
    const { organization_id, segment_id, session_id } = useParams<{
        organization_id: string;
        segment_id: string;
        session_id: string;
    }>();
    const [count, setCount] = useState(10);

    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const [data, setData] = useState<SessionResults>({
        sessions: [],
        totalCount: -1,
    });
    const { searchParams, hideLiveSessions } = useSearchContext();

    const {
        loading,
        fetchMore,
        data: sessionData,
        called,
    } = useGetSessionsQuery({
        variables: {
            params: searchParams,
            count: count + 10,
            organization_id,
            lifecycle:
                segment_id === LIVE_SEGMENT_ID
                    ? SessionLifecycle.Live
                    : hideLiveSessions
                    ? SessionLifecycle.Completed
                    : SessionLifecycle.All,
            starred: segment_id === STARRED_SEGMENT_ID,
        },
        pollInterval: SESSIONS_FEED_POLL_INTERVAL,
        onCompleted: (response) => {
            if (response.sessions) {
                setData(response.sessions);
            }
            setShowLoadingSkeleton(false);
        },
    });

    useEffect(() => {
        setShowLoadingSkeleton(true);
    }, [searchParams]);

    useEffect(() => {
        if (sessionData?.sessions) {
            setData(sessionData.sessions);
        }
    }, [sessionData]);

    const infiniteRef = useInfiniteScroll({
        checkInterval: 1200, // frequency to check (1.2s)
        loading,
        hasNextPage: data.sessions.length < data.totalCount,
        scrollContainer: 'parent',
        onLoadMore: () => {
            setCount((previousCount) => previousCount + 10);
            fetchMore({
                variables: {
                    params: searchParams,
                    count,
                    organization_id,
                    processed:
                        segment_id === LIVE_SEGMENT_ID
                            ? SessionLifecycle.Live
                            : hideLiveSessions
                            ? SessionLifecycle.Completed
                            : SessionLifecycle.All,
                },
            });
        },
    });

    const filteredSessions = useMemo(() => {
        if (loading) {
            return data.sessions;
        }
        if (searchParams.hide_viewed) {
            return data.sessions.filter((session) => !session?.viewed);
        }
        return data.sessions;
    }, [data.sessions, loading, searchParams.hide_viewed]);

    return (
        <>
            <div className={styles.fixedContent}>
                <div
                    className={styles.resultCount}
                >{`${formatNumberWithDelimiters(
                    data.totalCount
                )} sessions`}</div>
            </div>
            <div className={styles.feedContent}>
                <div ref={infiniteRef as RefObject<HTMLDivElement>}>
                    {loading && showLoadingSkeleton ? (
                        <Skeleton
                            height={110}
                            count={3}
                            style={{
                                borderRadius: 8,
                                marginTop: 14,
                                marginBottom: 14,
                            }}
                        />
                    ) : (
                        <>
                            {!data.sessions.length && called && !loading ? (
                                <SearchEmptyState item={'sessions'} />
                            ) : (
                                <>
                                    <LimitedSessionCard />
                                    {filteredSessions.map((u) => (
                                        <MinimalSessionCard
                                            session={u}
                                            key={u?.id}
                                            selected={session_id === u?.id}
                                        />
                                    ))}
                                </>
                            )}
                            {data.sessions.length < data.totalCount && (
                                <Skeleton
                                    height={110}
                                    style={{
                                        borderRadius: 8,
                                        marginTop: 14,
                                        marginBottom: 14,
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
