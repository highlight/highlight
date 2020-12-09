import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from 'antd';
import { Avatar } from '../../../components/Avatar/Avatar';

import styles from './MetadataBox.module.css';
import { DemoContext } from '../../../DemoContext';
import { stringify } from 'querystring';

export const MetadataBox = () => {
    const { session_id } = useParams();
    const { demo } = useContext(DemoContext);
    const { loading, error, data } = useQuery<{
        session: {
            location: any;
            os: string;
            browser: string;
            user_id: number;
            created_at: number;
            user_object: any;
            identifier: string;
        };
    }>(
        gql`
            query GetSession($id: ID!) {
                session(id: $id) {
                    location
                    os
                    browser
                    user_id
                    created_at
                    user_object
                    identifier
                }
            }
        `,
        {
            variables: {
                id: demo ? process.env.REACT_APP_DEMO_SESSION : session_id,
            },
            context: { headers: { 'Highlight-Demo': demo } },
        }
    );
    const created = new Date(data?.session.created_at ?? 0);
    let location: {
        city?: string;
        state?: string;
        postal?: string;
    } = {};
    try {
        location = JSON.parse(data?.session?.location)
    } catch (error) {}
    return (
        <div className={styles.locationBox}>
            {loading ? (
                <div className={styles.skeletonWrapper}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                </div>
            ) : error ? (
                <p>{error?.toString()}</p>
            ) : (
                <>
                    <div className={styles.userAvatarWrapper}>
                        <Avatar
                            style={{ width: 75 }}
                            seed={data?.session.user_id.toString() ?? ''}
                        />
                    </div>
                    <div className={styles.userContentWrapper}>
                        <div className={styles.headerWrapper}>
                            <div>User#{data?.session.user_id}</div>
                            {data?.session.identifier && (
                                <div className={styles.userIdSubHeader}>
                                    {data?.session.identifier}
                                </div>
                            )}
                        </div>
                        <div className={styles.userInfoWrapper}>
                            <div className={styles.userText}>
                                {location?.city ? location.city + ', ' : ''}
                                {location?.state ? location.state + ' ' : ''}
                                {location?.postal ? location.postal : ''}
                            </div>
                            <div className={styles.userText}>
                                {created.toUTCString()}
                            </div>
                            {data?.session.browser && (
                                <div className={styles.userText}>
                                    {data?.session.os},&nbsp;
                                    {data?.session.browser} &nbsp;-&nbsp;
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
