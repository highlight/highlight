import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Skeleton, Tag } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { Avatar } from '../../../components/Avatar/Avatar';

import styles from './MetadataBox.module.scss';
import { DemoContext } from '../../../DemoContext';

type Field = {
    type: string;
    name: string;
    value: string;
};

export const MetadataBox = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const [expanded, setExpanded] = useState(false);
    const { demo } = useContext(DemoContext);

    const { loading, error, data } = useQuery<{
        session: {
            os_name: string;
            os_version: string;
            browser_name: string;
            browser_version: string;
            city: string;
            state: string;
            postal: string;
            user_id: number;
            created_at: number;
            user_object: any;
            identifier: string;
            fields: Array<Field>;
        };
    }>(
        gql`
            query GetSession($id: ID!) {
                session(id: $id) {
                    os_name
                    os_version
                    browser_name
                    browser_version
                    city
                    state
                    postal
                    user_id
                    created_at
                    user_object
                    identifier
                    fields {
                        name
                        value
                        type
                    }
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
                            seed={data?.session.identifier ?? ''}
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
                        <div className={styles.tagDiv}>
                            <div
                                className={
                                    expanded
                                        ? styles.tagWrapperExpanded
                                        : styles.tagWrapper
                                }
                            >
                                {data?.session.fields
                                    .filter(
                                        (f) =>
                                            f.type === 'user' &&
                                            f.name !== 'identifier' &&
                                            f.value.length
                                    )
                                    .map((f) => (
                                        <Tag
                                            color="#F2EEFB"
                                            style={{
                                                marginTop: '3px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: 'black',
                                                    fontWeight: 300,
                                                }}
                                                className={styles.tagEllipsis}
                                            >
                                                {f.name}:&nbsp;{f.value}
                                            </span>
                                        </Tag>
                                    ))}
                            </div>
                            <div
                                className={styles.expandArrow}
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? <UpOutlined /> : <DownOutlined />}
                            </div>
                        </div>
                        <div className={styles.userInfoWrapper}>
                            <div className={styles.userText}>
                                {data?.session.city
                                    ? data.session.city + ', '
                                    : ''}
                                {data?.session.state
                                    ? data.session.state + ' '
                                    : ''}
                                {data?.session.postal
                                    ? data.session.postal
                                    : ''}
                            </div>
                            <div className={styles.userText}>
                                {created.toUTCString()}
                            </div>
                            {data?.session.browser_name && (
                                <div className={styles.userText}>
                                    {data?.session.os_name},&nbsp;
                                    {data?.session.browser_name}&nbsp;-&nbsp;
                                    {data?.session.browser_version}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
