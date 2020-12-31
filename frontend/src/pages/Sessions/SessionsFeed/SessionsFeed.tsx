import { gql, useQuery } from '@apollo/client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SearchContext, SearchParams } from '../SearchContext/SearchContext';
import { ReactComponent as PlayButton } from '../../../static/play-button.svg';
import styles from './SessionsFeed.module.scss';
import classNames from 'classnames/bind';
import { MillisToMinutesAndSecondsVerbose } from '../../../util/time';
import { Skeleton } from 'antd';
import { useDebouncedCallback } from 'use-debounce/lib';

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
    const resultsRef = useRef<HTMLDivElement>(null);
    const [count, setCount] = useState(10);
    const { searchParams } = useContext(SearchContext);
    const { loading, data } = useQuery<
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
`, { variables: { params: searchParams, count, organization_id: parseInt(organization_id) } });

    const countDebounced = useDebouncedCallback(() => {
        setCount((count) => count + 10);
    }, 500);

    useEffect(() => {
        document.addEventListener('scroll', (e: any) => {
            var refHeight = resultsRef?.current?.getBoundingClientRect().bottom;
            const innerHeight = window?.innerHeight;
            if (!refHeight) {
                refHeight = 0;
            }
            const diff = Math.abs(refHeight - innerHeight);
            if (diff < 50) {
                countDebounced.callback();
            }
        });
        return () => {
            document.removeEventListener('scroll', (e) => console.log(e));
        };
    }, [countDebounced]);

    if (loading) {
        return <Skeleton />
    }
    return (
        <div ref={resultsRef}>
            {data?.sessionsBETA.map((u) =>
                <SessionCard session={u} />
            )}
        </div>);
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