import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar } from '../../../components/Avatar/Avatar';

import styles from './MetadataBox.module.scss';
import { DemoContext } from '../../../DemoContext';
import { useGetSessionQuery } from '../../../graph/generated/hooks';
import { Field } from '../../../components/Field/Field';
import Skeleton from 'react-loading-skeleton';

type Field = {
    type: string;
    name: string;
    value: string;
};

export const MetadataBox = () => {
    const { session_id } = useParams<{ session_id: string }>();
    const { demo } = useContext(DemoContext);

    const { loading, data } = useGetSessionQuery({
        variables: {
            id: demo ? process.env.REACT_APP_DEMO_SESSION ?? '0' : session_id,
        },
        context: { headers: { 'Highlight-Demo': demo } },
    });
    const created = new Date(data?.session?.created_at ?? 0);
    const [parsedFields, setParsedFields] = useState<Array<Field>>([]);

    useEffect(() => {
        const fields = data?.session?.fields?.filter((f) => {
            if (
                f &&
                f.type === 'user' &&
                f.name !== 'identifier' &&
                f.value.length
            ) {
                return true;
            }
            return false;
        }) as Field[];
        setParsedFields(fields);
    }, [data]);
    return (
        <div className={styles.locationBox}>
            <>
                <div className={styles.userAvatarWrapper}>
                    {loading ? (
                        <Skeleton circle={true} height={60} width={60} />
                    ) : (
                        <Avatar
                            style={{ width: 75 }}
                            seed={data?.session?.identifier ?? ''}
                        />
                    )}
                </div>
                <div className={styles.userContentWrapper}>
                    <div className={styles.headerWrapper}>
                        {loading ? (
                            <Skeleton
                                count={2}
                                style={{ height: 20, marginBottom: 5 }}
                            />
                        ) : (
                            <>
                                <div>User#{data?.session?.user_id}</div>
                                {data?.session?.identifier && (
                                    <div className={styles.userIdSubHeader}>
                                        {data?.session?.identifier}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {!(!parsedFields?.length || loading) && (
                        <div className={styles.tagDiv}>
                            <div className={styles.tagWrapper}>
                                {parsedFields?.map((f, i) => (
                                    <Field
                                        key={i.toString()}
                                        color={'normal'}
                                        k={f.name}
                                        v={f.value}
                                    ></Field>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className={styles.userInfoWrapper}>
                        {loading ? (
                            <>
                                <Skeleton
                                    count={3}
                                    style={{ height: 15, marginBottom: 5 }}
                                />
                            </>
                        ) : (
                            <>
                                <div className={styles.userText}>
                                    {data?.session?.city
                                        ? data.session.city + ', '
                                        : ''}
                                    {data?.session?.state
                                        ? data.session.state + ' '
                                        : ''}
                                    {data?.session?.postal
                                        ? data.session.postal
                                        : ''}
                                </div>
                                <div className={styles.userText}>
                                    {created.toLocaleString('en-us', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZoneName: 'short',
                                    })}
                                </div>
                                {data?.session?.browser_name && (
                                    <div className={styles.userText}>
                                        {data?.session.os_name},{' '}
                                        {data?.session.browser_name} -{' '}
                                        {data?.session.browser_version}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>
        </div>
    );
};
