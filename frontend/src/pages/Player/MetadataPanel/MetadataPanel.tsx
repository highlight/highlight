import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Field } from '../../../components/Field/Field';
import { useGetSessionQuery } from '../../../graph/generated/hooks';
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
                <h2>loading</h2>
            ) : (
                <>
                    <div className={styles.section}>
                        <h2 className={styles.header}>Session</h2>
                        <p>
                            {data?.session?.city}, {data?.session?.state}{' '}
                            {data?.session?.postal}
                        </p>
                    </div>
                    <div>
                        <h2 className={styles.header}>User details</h2>
                        {!(!parsedFields?.length || loading) && (
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
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MetadataPanel;
