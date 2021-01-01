import { gql, useQuery } from '@apollo/client';
import React, { RefObject, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import { ReactComponent as PlayButton } from '../../../static/play-button.svg';
import styles from './SessionsFeed.module.scss';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { MillisToMinutesAndSecondsVerbose } from '../../../util/time';
import useInfiniteScroll from 'react-infinite-scroll-hook';

type Session = {
    id: number;
    user_id: number;
    identifier: string;
    os_name: string;
    browser_name: string;
    browser_version: string;
    city: string;
    state: string;
    postal: string;
    created_at: string;
    length: number;
}

export const SessionFeed = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [count, setCount] = useState(10);
    const [loadData, setLoadData] = useState(false);
    const [loadingState, setLoadingState] = useState(false);
    const [data, setData] = useState<Array<Session>>([]);
    const { searchParams } = useContext(SearchContext);
    const { refetch } = useQuery<
        { sessionsBETA: Session[] },
        { count: number; organization_id: number; params: SearchParams }
    >(
        gql`
    query GetSessionsBETA(
        $organization_id: ID!
        $count: Int!
        $params: SearchParams
    ) {
        sessionsBETA(
            organization_id: $organization_id
            count: $count
            params: $params
        ) {
            id, user_id, identifier, os_name, browser_name, browser_version, city, state, postal, created_at, length
        }
    }
`, { skip: true });

    // On the component mount, shoot out a request.
    useEffect(() => {
        setLoadData(true);
    }, [])

    // When the search params change, shoot out another request.
    useEffect(() => {
        setLoadData(true);
        setLoadingState(true);
    }, [searchParams])

    useEffect(() => {
        if (!loadData) return;
        refetch({ params: searchParams, count: count + 10, organization_id: parseInt(organization_id) }).then((res) => {
            setLoadData(false);
            setLoadingState(false);
            setData(res.data.sessionsBETA)
            setCount(c => c + 10)
        })
    }, [loadData, count, organization_id, refetch, searchParams])

    const infiniteRef = useInfiniteScroll({
        loading: loadData,
        hasNextPage: true,
        onLoadMore: () => {
            setLoadData(true)
        },
    });

    if (loadingState) {
        return (
            <SkeletonTheme color={"#F5F5F5"} highlightColor={"#FCFCFC"}>
                <Skeleton height={80} count={3} style={{ borderRadius: 8, marginTop: 14, marginBottom: 14 }} />
            </SkeletonTheme>
        )
    }

    return (
        <div ref={infiniteRef as RefObject<HTMLDivElement>}>
            {data.map((u) =>
                <SessionCard session={u} />
            )}
        </div >
    );
}

const SessionCard = ({ session }: { session: Session }) => {
    const u = session;
    const { organization_id } = useParams<{ organization_id: string }>();
    const created = new Date(u.created_at);
    return (
        <Link
            to={`/${organization_id}/sessions/${u.id}`}
            key={u.id}
        >
            <div className={styles.sessionCard}>
                <div className={styles.playButton}>
                    <PlayButton />
                </div>
                <div className={styles.sessionTextWrapper}>
                    <div
                        className={
                            styles.sessionTextSection
                        }
                    >
                        <div
                            className={styles.blueTitle}
                        >{`User#${u?.user_id}`}</div>
                        <div className={classNames(styles.regSubTitle, "rr-block")}>
                            {u?.identifier}
                        </div>
                    </div>
                    <div
                        className={
                            styles.sessionTextSection
                        }
                    >
                        <div className={styles.blueTitle}>
                            {created.toLocaleString(
                                'en-us',
                                {
                                    day: 'numeric',
                                    month: 'short',
                                    minute: 'numeric',
                                    hour: 'numeric',
                                }
                            )}
                        </div>
                        <div className={styles.regSubTitle}>
                            {MillisToMinutesAndSecondsVerbose(
                                u?.length
                            ) || '30 min 20 sec'}
                        </div>
                    </div>
                    <div
                        className={
                            styles.sessionTextSection
                        }
                    >
                        <div className={styles.regTitle}>
                            {u?.os_name &&
                                u?.browser_name
                                ? u?.os_name +
                                ' • ' +
                                u?.browser_name
                                : 'Desktop • Chrome'}
                        </div>
                        <div className={styles.regSubTitle}>
                            {u?.city}{u?.city && u?.state && ','} {u?.state}{' '}
                            {u?.postal}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}