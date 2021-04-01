import React, {
    RefObject,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext } from '../SearchContext/SearchContext';
import styles from './SessionsFeed.module.scss';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { MillisToMinutesAndSecondsVerbose } from '../../../util/time';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ReactComponent as ViewedIcon } from '../../../static/viewed.svg';
import { ReactComponent as UnviewedIcon } from '../../../static/unviewed.svg';
import { Avatar } from '../../../components/Avatar/Avatar';
import { message, Tooltip } from 'antd';
import { UserPropertyInput } from '../SearchInputs/UserPropertyInputs';
import {
    useGetBillingDetailsQuery,
    useGetSessionsQuery,
    useMarkSessionAsViewedMutation,
} from '../../../graph/generated/hooks';
import {
    Maybe,
    Session,
    SessionResults,
} from '../../../graph/generated/schemas';
import { SearchEmptyState } from '../../../components/SearchEmptyState/SearchEmptyState';
import { Field } from '../../../components/Field/Field';
import LimitedSessionCard from '../../../components/Upsell/LimitedSessionsCard/LimitedSessionsCard';
import {
    LIVE_SEGMENT_ID,
    STARRED_SEGMENT_ID,
} from '../SearchSidebar/SegmentPicker/SegmentPicker';

const SESSIONS_FEED_POLL_INTERVAL = 5000;

export const SessionFeed = () => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [count, setCount] = useState(10);
    const { data: billingData } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    /** Show upsell when the current usage is 80% of the organization's plan. */
    const upsell =
        (billingData?.billingDetails.meter ?? 0) /
            (billingData?.billingDetails.plan.quota ?? 1) >=
        0.8;
    // Used to determine if we need to show the loading skeleton. The loading skeleton should only be shown on the first load and when searchParams changes. It should not show when loading more sessions via infinite scroll.
    const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(true);
    const [data, setData] = useState<SessionResults>({
        sessions: [],
        totalCount: -1,
    });
    const { searchParams } = useContext(SearchContext);

    const { loading, fetchMore, data: sessionData } = useGetSessionsQuery({
        variables: {
            params: searchParams,
            count: count + 10,
            organization_id,
            processed: segment_id !== LIVE_SEGMENT_ID,
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
                    processed: false,
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
                    <div className={styles.userInputWrapper}>
                        <UserPropertyInput include />
                    </div>
                </div>
                <div
                    className={styles.resultCount}
                >{`${data.totalCount} sessions`}</div>
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
                            {!data.sessions.length ? (
                                <SearchEmptyState item={'sessions'} />
                            ) : (
                                <>
                                    {upsell && <LimitedSessionCard />}
                                    {filteredSessions.map((u) => {
                                        return (
                                            <SessionCard
                                                session={u}
                                                key={u?.id}
                                            />
                                        );
                                    })}
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

const SessionCard = ({ session }: { session: Maybe<Session> }) => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [hovered, setHovered] = useState(false);
    const created = new Date(session?.created_at);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();

    return (
        <div
            className={styles.sessionCardWrapper}
            key={session?.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Link to={`/${organization_id}/sessions/${session?.id}`}>
                <div className={styles.sessionCard}>
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
                                        : session?.user_id.toString()) ?? ''
                                }
                                style={{ height: 60, width: 60 }}
                            />
                        </div>
                        <div className={styles.sessionTextSectionWrapper}>
                            <div className={styles.sessionTextSection}>
                                <div
                                    className={styles.topText}
                                >{`User#${session?.user_id}`}</div>
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
                                <div className={styles.topText}>
                                    {segment_id === LIVE_SEGMENT_ID
                                        ? 'In Progress'
                                        : MillisToMinutesAndSecondsVerbose(
                                              session?.length || 0
                                          ) || '30 min 20 sec'}
                                </div>
                                <div className={styles.middleText}>
                                    {created.toLocaleString('en-us', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div className={styles.bottomText}>
                                    {created.toLocaleString('en-us', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short',
                                    })}
                                </div>
                            </div>
                            <div className={styles.sessionTextSection}>
                                <div className={styles.topText}>
                                    {session?.browser_name}
                                    {session?.browser_version &&
                                        ' / ' + session?.browser_version}
                                </div>
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
                                {session?.viewed ? (
                                    <></>
                                ) : (
                                    <div className={styles.readMarker}></div>
                                )}
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
