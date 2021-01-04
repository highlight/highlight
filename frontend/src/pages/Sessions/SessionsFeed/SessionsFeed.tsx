import { gql, useQuery } from '@apollo/client';
import React, { RefObject, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import styles from './SessionsFeed.module.scss';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import classNames from 'classnames/bind';
import { MillisToMinutesAndSecondsVerbose } from '../../../util/time';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Avatar } from '../../../components/Avatar/Avatar';
import { Tag } from 'antd';


type Field = {
    type: string;
    name: string;
    value: string;
}

type Session = {
    id: number;
    user_id: number;
    identifier: string;
    os_name: string;
    os_version: string;
    browser_name: string;
    browser_version: string;
    city: string;
    state: string;
    postal: string;
    created_at: string;
    length: number;
    fields: Array<Field>;
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
            id, user_id, identifier, os_name, os_version, browser_name, browser_version, city, state, postal, created_at, length, 
            fields {
                name
                value
                type
            }
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
        checkInterval: 1200, // frequency to check (1.2s)
        loading: loadData,
        hasNextPage: true,
        onLoadMore: () => {
            setLoadData(true)
        },
    });

    if (loadingState) {
        return (
            <SkeletonTheme color={"#F5F5F5"} highlightColor={"#FCFCFC"}>
                <Skeleton height={110} count={3} style={{ borderRadius: 8, marginTop: 14, marginBottom: 14 }} />
            </SkeletonTheme>
        )
    }

    return (
        <div ref={infiniteRef as RefObject<HTMLDivElement>}>
            {data.map((u) => {
                return <SessionCard session={u} />;
            }
            )}
        </div >
    );
}

const SessionCard = ({ session }: { session: Session }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [hovered, setHovered] = useState(false);
    const created = new Date(session.created_at);
    return (
        <Link
            to={`/${organization_id}/sessions/${session.id}`}
            key={session.id}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={styles.sessionCard}>
                {hovered && <div className={styles.hoverBorder} />}
                <div className={styles.avatarWrapper}>
                    <Avatar seed={session.identifier} style={{ height: 60, width: 60 }} />
                </div>
                <div
                    className={
                        styles.sessionTextSection
                    }
                >
                    <div
                        className={styles.topText}
                    >{`User#${session?.user_id}`}</div>
                    <div className={classNames(styles.middleText, "rr-block")}>
                        {session?.identifier}
                    </div>
                    <div className={styles.tagWrapper}>
                        {session.fields
                            .filter(f => f.type === "user" && f.name !== "identifier" && f.value.length)
                            .map(f =>
                                <Tag color="#F2EEFB"><span style={{ color: 'black', fontWeight: 300 }}>
                                    {f.name}:&nbsp;{f.value}
                                </span></Tag>
                            )}
                    </div>
                </div>
                <div
                    className={
                        styles.sessionTextSection
                    }
                >
                    <div className={styles.topText}>
                        {MillisToMinutesAndSecondsVerbose(
                            session?.length
                        ) || '30 min 20 sec'}
                    </div>
                    <div className={styles.middleText}>
                        {created.toLocaleString(
                            'en-us',
                            {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            }
                        )}
                    </div>
                    <div className={styles.bottomText}>
                        {created.toLocaleString(
                            'en-us',
                            {
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short',
                            }
                        )}
                    </div>
                </div>
                <div
                    className={
                        styles.sessionTextSection
                    }
                >
                    <div className={styles.topText}>
                        {session.browser_name}
                        &nbsp;/&nbsp;
                        {session.browser_version}
                    </div>
                    <div className={styles.middleText}>
                        {session.os_name}
                        &nbsp;/&nbsp;
                        {session.os_version}
                    </div>
                    <div className={styles.bottomText}>
                        {session.city}
                        ,&nbsp;
                        {session.state}
                        &nbsp;
                        {session.postal}
                    </div>
                </div>
            </div>
        </Link>
    );
}