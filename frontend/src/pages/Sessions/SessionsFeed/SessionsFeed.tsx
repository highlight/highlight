import { message } from 'antd';
import classNames from 'classnames/bind';
import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';

import { Avatar } from '../../../components/Avatar/Avatar';
import Dot from '../../../components/Dot/Dot';
import { Field } from '../../../components/Field/Field';
import { SearchEmptyState } from '../../../components/SearchEmptyState/SearchEmptyState';
import Tooltip from '../../../components/Tooltip/Tooltip';
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard';
import {
    useGetSessionsQuery,
    useMarkSessionAsStarredMutation,
    useMarkSessionAsViewedMutation,
} from '../../../graph/generated/hooks';
import {
    Maybe,
    Session,
    SessionLifecycle,
    SessionResults,
} from '../../../graph/generated/schemas';
import { ReactComponent as StarIcon } from '../../../static/star.svg';
import { ReactComponent as FilledStarIcon } from '../../../static/star-filled.svg';
import { ReactComponent as UnviewedIcon } from '../../../static/unviewed.svg';
import { ReactComponent as ViewedIcon } from '../../../static/viewed.svg';
import { formatNumberWithDelimiters } from '../../../util/numbers';
import { MillisToMinutesAndSecondsVerbose } from '../../../util/time';
import { useSearchContext } from '../SearchContext/SearchContext';
import {
    LIVE_SEGMENT_ID,
    STARRED_SEGMENT_ID,
} from '../SearchSidebar/SegmentPicker/SegmentPicker';
import FirstTimeDecorations from './components/FirstTimeDecorations/FirstTimeDecorations';
import SessionSearch from './components/SessionSearch/SessionSearch';
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
    const { searchParams } = useSearchContext();
    const {
        show_live_sessions,
        ...searchParamsExceptForShowLiveSessions
    } = searchParams;

    const {
        loading,
        fetchMore,
        data: sessionData,
        called,
    } = useGetSessionsQuery({
        variables: {
            params: searchParamsExceptForShowLiveSessions,
            count: count + 10,
            organization_id,
            lifecycle:
                segment_id === LIVE_SEGMENT_ID
                    ? SessionLifecycle.Live
                    : !show_live_sessions
                    ? SessionLifecycle.Completed
                    : SessionLifecycle.All,
            starred: segment_id === STARRED_SEGMENT_ID,
        },
        // pollInterval: SESSIONS_FEED_POLL_INTERVAL,
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
                            : !searchParams.show_live_sessions
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
                <div className={styles.mainUserInput}>
                    <SessionSearch />
                </div>
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
                                        <SessionCard
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

const SessionCard = ({
    session,
    selected,
}: {
    session: Maybe<Session>;
    selected: boolean;
}) => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [hovered, setHovered] = useState(false);
    const created = new Date(session?.created_at);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();
    const [markSessionAsStarred] = useMarkSessionAsStarredMutation({
        update(cache) {
            cache.modify({
                fields: {
                    session(existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            starred: !existingSession.starred,
                        };
                        return updatedSession;
                    },
                },
            });
        },
    });
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={styles.sessionCardWrapper}
            key={session?.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {(session?.starred || hovered) && (
                <Tooltip title={session?.starred ? 'Unstar' : 'Star'}>
                    <div
                        className={styles.starredIconWrapper}
                        onClick={() => {
                            markSessionAsStarred({
                                variables: {
                                    id: session?.id || '',
                                    starred: !session?.starred,
                                },
                            })
                                .then(() => {
                                    message.success(
                                        'Updated session status!',
                                        3
                                    );
                                })
                                .catch(() => {
                                    message.error(
                                        'Error updating session status!',
                                        3
                                    );
                                });
                        }}
                    >
                        {session?.starred ? (
                            <FilledStarIcon className={styles.starredIcon} />
                        ) : (
                            <StarIcon className={styles.actionIcon} />
                        )}
                    </div>
                </Tooltip>
            )}
            <Link to={`/${organization_id}/sessions/${session?.id}`}>
                <div
                    className={classNames(styles.sessionCard, {
                        [styles.selected]: selected,
                    })}
                    ref={containerRef}
                >
                    <FirstTimeDecorations
                        containerRef={containerRef}
                        session={session}
                    />
                    <div
                        className={classNames(
                            styles.hoverBorderLeft,
                            hovered && styles.hoverBorderOn
                        )}
                    />
                    <div className={styles.sessionCardContentWrapper}>
                        <div className={styles.avatarWrapper}>
                            <Avatar
                                seed={
                                    (session?.identifier
                                        ? session?.identifier
                                        : (
                                              session?.fingerprint ||
                                              session?.user_id ||
                                              ''
                                          ).toString()) ?? ''
                                }
                                style={{ height: 60, width: 60 }}
                            />
                        </div>
                        <div className={styles.sessionTextSectionWrapper}>
                            <div className={styles.sessionTextSection}>
                                <div className={styles.topText}>{`Device#${
                                    session?.fingerprint || session?.user_id
                                }`}</div>
                                <div
                                    className={classNames(
                                        styles.middleText,
                                        'highlight-block'
                                    )}
                                >
                                    {session?.identifier}
                                </div>
                                <div className={styles.tagWrapper}>
                                    {session?.fields
                                        ?.filter(
                                            (f) =>
                                                f?.type === 'user' &&
                                                f?.name !== 'identifier' &&
                                                f?.value.length
                                        )
                                        .map(
                                            (f) =>
                                                f && (
                                                    <Field
                                                        color={'normal'}
                                                        key={f.value}
                                                        k={f.name}
                                                        v={f.value}
                                                    />
                                                )
                                        )}
                                </div>
                            </div>
                            <div className={styles.sessionTextSection}>
                                <Tooltip
                                    title={
                                        session?.processed ? (
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td>Active:</td>
                                                        <td>
                                                            {MillisToMinutesAndSecondsVerbose(
                                                                session.active_length ||
                                                                    0
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>Total:</td>
                                                        <td>
                                                            {MillisToMinutesAndSecondsVerbose(
                                                                session.length ||
                                                                    0
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        ) : null
                                    }
                                    align={{ offset: [-40, 0] }}
                                >
                                    <div className={styles.topText}>
                                        {session?.processed &&
                                        segment_id !== LIVE_SEGMENT_ID
                                            ? MillisToMinutesAndSecondsVerbose(
                                                  session.active_length || 0
                                              )
                                            : 'Live'}
                                    </div>
                                </Tooltip>
                                <p className={styles.middleText}>
                                    {created.toLocaleString('en-us', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className={styles.bottomText}>
                                    {created.toLocaleString('en-us', {
                                        hour: '2-digit',
                                        second: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short',
                                    })}
                                </p>
                            </div>
                            <div className={styles.sessionTextSection}>
                                <p className={styles.topText}>
                                    {session?.browser_name}
                                    {session?.browser_version &&
                                        ' / ' + session?.browser_version}
                                </p>
                                <div className={styles.middleText}>
                                    {session?.os_name}
                                    {session?.os_version &&
                                        ' / ' + session?.os_version}
                                </div>
                                <div className={styles.bottomText}>
                                    {session?.city}
                                    {session?.state && ', ' + session?.state}
                                    &nbsp;
                                    {session?.postal}
                                </div>
                            </div>
                            <div className={styles.readMarkerContainer}>
                                {!session?.viewed && <Dot />}
                            </div>
                        </div>
                    </div>
                    <div
                        className={classNames(
                            styles.hoverBorderRight,
                            hovered && styles.hoverBorderOn
                        )}
                    />
                </div>
            </Link>
            <Tooltip
                title={session?.viewed ? 'Mark as Unviewed' : 'Mark as Viewed'}
            >
                <button
                    className={styles.sessionCardAction}
                    onClick={() => {
                        markSessionAsViewed({
                            variables: {
                                id: session?.id || '',
                                viewed: !session?.viewed,
                            },
                        })
                            .then(() => {
                                message.success('Updated session status!', 3);
                            })
                            .catch(() => {
                                message.error(
                                    'Error updating session status!',
                                    3
                                );
                            });
                    }}
                >
                    {session?.viewed ? (
                        <UnviewedIcon className={styles.actionIcon} />
                    ) : (
                        <ViewedIcon className={styles.actionIcon} />
                    )}
                </button>
            </Tooltip>
        </div>
    );
};
