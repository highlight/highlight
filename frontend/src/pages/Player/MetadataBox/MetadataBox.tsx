import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from 'antd';
import { Avatar } from '../../../components/Avatar/Avatar';

import styles from './MetadataBox.module.css';

export const MetadataBox = () => {
    const { session_id } = useParams();
    const { loading, error, data } = useQuery<{
        session: {
            details: any;
            user_id: number;
            created_at: number;
            user_object: any;
            identifier: string;
        };
    }>(
        gql`
            query GetSession($id: ID!) {
                session(id: $id) {
                    details
                    user_id
                    created_at
                    user_object
                    identifier
                }
            }
        `,
        { variables: { id: session_id } }
    );
    const created = new Date(data?.session.created_at ?? 0);
    var details: any = {};
    try {
        details = JSON.parse(data?.session?.details);
    } catch (e) {}
    return (
        <div className={styles.locationBox}>
            <div className={styles.innerLocationBox}>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 2 }} />
                ) : error ? (
                    <p>{error?.toString()}</p>
                ) : (
                    <>
                        <Avatar
                            style={{ width: 65 }}
                            seed={data?.session.user_id.toString() ?? ''}
                        />
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
                                <div>
                                    {details?.city}, {details?.state} &nbsp;
                                    {details?.postal}
                                </div>
                                <div>{created.toUTCString()}</div>
                                {details?.browser && (
                                    <div>
                                        {details?.browser?.os},&nbsp;
                                        {details?.browser?.name} &nbsp;-&nbsp;
                                        {details?.browser?.version}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
