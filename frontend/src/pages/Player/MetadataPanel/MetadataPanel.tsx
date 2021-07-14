import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';

import DataCard from '../../../components/DataCard/DataCard';
import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip';
import {
    useGetAdminQuery,
    useGetSessionQuery,
} from '../../../graph/generated/hooks';
import { SessionPageSearchParams } from '../utils/utils';
import styles from './MetadataPanel.module.scss';

type Field = {
    type: string;
    name: string;
    value: string;
};

const MetadataPanel = () => {
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
    }>();

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
                    <DataCard title="Session">
                        <div className={styles.table}>
                            <p className={styles.key}>Environment</p>
                            <p
                                className={classNames(
                                    styles.centerAlign,
                                    styles.value
                                )}
                            >
                                <span className={styles.sentenceCase}>
                                    {data?.session?.environment || 'Production'}
                                </span>
                                <InfoTooltip
                                    className={styles.infoTooltip}
                                    title={
                                        <>
                                            You can set the environment based on
                                            where the session is recorded.{' '}
                                            <a
                                                href="https://docs.highlight.run/reference#options"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Learn more about environments.
                                            </a>
                                        </>
                                    }
                                />
                            </p>

                            <p className={styles.key}>App Version</p>
                            <p
                                className={classNames(
                                    styles.centerAlign,
                                    styles.value
                                )}
                            >
                                <span className={styles.sentenceCase}>
                                    {data?.session?.app_version ||
                                        'App Version Not Set'}
                                </span>
                                <InfoTooltip
                                    className={styles.infoTooltip}
                                    title={
                                        <>
                                            This is the app version for your
                                            application. You can set the version
                                            to help categorize what version of
                                            the app a user was using.{' '}
                                            <a
                                                href="https://docs.highlight.run/reference#options"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Learn more about setting the
                                                version.
                                            </a>
                                        </>
                                    }
                                />
                            </p>

                            {data?.session?.city && (
                                <>
                                    <p className={styles.key}>Location</p>
                                    <p
                                        className={classNames(
                                            styles.centerAlign,
                                            styles.value
                                        )}
                                    >
                                        {data?.session?.city},{' '}
                                        {data?.session?.state}{' '}
                                        {data?.session?.postal}
                                    </p>
                                </>
                            )}

                            {data?.session?.object_storage_enabled &&
                                a_data?.admin?.email.includes(
                                    'highlight.run'
                                ) && (
                                    <>
                                        <p className={styles.key}>
                                            Session Size
                                        </p>
                                        <p className={styles.value}>
                                            {`${
                                                data.session.payload_size /
                                                1000000
                                            }`}
                                            mb
                                        </p>

                                        <p className={styles.key}>
                                            Highlight Version
                                        </p>
                                        <p className={styles.value}>
                                            {data.session.client_version}
                                        </p>
                                    </>
                                )}
                        </div>
                    </DataCard>
                    <DataCard title="User">
                        <div className={styles.table}>
                            <p className={styles.key}>Identifer</p>
                            <p className={styles.value}>
                                {data?.session?.identifier}
                            </p>

                            {!(!parsedFields?.length || loading) ? (
                                <>
                                    {parsedFields?.map((f) => (
                                        <React.Fragment
                                            key={`${f.name}-${f.value}`}
                                        >
                                            <p className={styles.key}>
                                                {f.name}
                                            </p>
                                            <p className={styles.value}>
                                                {f.value}
                                            </p>
                                        </React.Fragment>
                                    ))}
                                </>
                            ) : (
                                <div
                                    className={classNames(
                                        styles.noMetadataContainer
                                    )}
                                >
                                    <p>
                                        Did you know that you can enrich
                                        sessions with additional metadata?
                                        They'll show up here. You can{' '}
                                        <a
                                            href="https://docs.highlight.run/docs/identifying-users"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            learn more here
                                        </a>
                                        .
                                    </p>
                                </div>
                            )}
                            <p className={styles.key}>Locale</p>
                            <p className={styles.value}>
                                {data?.session?.language}
                            </p>
                        </div>
                    </DataCard>

                    <DataCard title="Device">
                        <div className={styles.table}>
                            {data?.session?.fingerprint && (
                                <>
                                    <p className={styles.key}>Device ID</p>
                                    <p className={styles.value}>
                                        <Link
                                            to={`/${organization_id}/sessions?${new URLSearchParams(
                                                {
                                                    [SessionPageSearchParams.deviceId]: data?.session.fingerprint.toString(),
                                                }
                                            ).toString()}`}
                                        >
                                            #{data?.session?.fingerprint}
                                        </Link>
                                    </p>
                                </>
                            )}
                        </div>
                    </DataCard>
                </>
            )}
        </div>
    );
};

export default MetadataPanel;
