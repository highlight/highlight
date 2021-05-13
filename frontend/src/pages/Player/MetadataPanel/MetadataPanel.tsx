import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';

import { Field } from '../../../components/Field/Field';
import {
    useGetAdminQuery,
    useGetSessionQuery,
} from '../../../graph/generated/hooks';
import styles from './MetadataPanel.module.scss';

type Field = {
    type: string;
    name: string;
    value: string;
};

const MetadataPanel = () => {
    const { session_id } = useParams<{ session_id: string }>();

    const { loading, data } = useGetSessionQuery({
        variables: {
            id: session_id,
        },
        context: { headers: { 'Highlight-Demo': false } },
    });
    const [parsedFields, setParsedFields] = useState<Field[]>([]);

    const { data: a_data } = useGetAdminQuery({});

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
        <div className={styles.metadataPanel}>
            {loading && !data?.session ? (
                <Skeleton
                    count={4}
                    height={35}
                    style={{
                        marginTop: 8,
                        marginBottom: 8,
                    }}
                />
            ) : (
                <>
                    <div className={styles.section}>
                        <h2 className={styles.header}>Session</h2>
                        <p>
                            {data?.session?.city}, {data?.session?.state}{' '}
                            {data?.session?.postal}
                        </p>
                        {data?.session?.object_storage_enabled &&
                        a_data?.admin?.email.includes('highlight.run') ? (
                            <p>
                                {`${data.session.payload_size / 1000000}`}
                                mb
                            </p>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div>
                        <h2 className={styles.header}>User details</h2>
                        {!(!parsedFields?.length || loading) ? (
                            <div className={styles.tagDiv}>
                                <div className={styles.tagWrapper}>
                                    {parsedFields?.map((f, i) => (
                                        <Field
                                            key={i.toString()}
                                            color={'normal'}
                                            k={f.name}
                                            v={f.value}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.noMetadataContainer}>
                                <p>
                                    Did you know that you can enrich sessions
                                    with additional metadata? They'll show up
                                    here. You can learn more{' '}
                                    <a
                                        href="https://docs.highlight.run/docs/identifying-users"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        here
                                    </a>
                                    .
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MetadataPanel;
