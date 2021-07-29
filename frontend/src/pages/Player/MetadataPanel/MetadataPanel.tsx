import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';

import DataCard from '../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../components/KeyValueTable/KeyValueTable';
import {
    useGetAdminQuery,
    useGetSessionQuery,
} from '../../../graph/generated/hooks';
import { formatSize } from '../Toolbar/DevToolsWindow/ResourcePage/ResourcePage';
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

    const sessionData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Environment',
            valueDisplayValue: data?.session?.environment || 'Production',
            valueInfoTooltipMessage: (
                <>
                    You can set the environment based on where the session is
                    recorded.{' '}
                    <a
                        href="https://docs.highlight.run/reference#options"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about environments.
                    </a>
                </>
            ),
            renderType: 'string',
        },
        {
            keyDisplayValue: 'App Version',
            valueDisplayValue:
                data?.session?.app_version || 'App Version Not Set',
            valueInfoTooltipMessage: (
                <>
                    This is the app version for your application. You can set
                    the version to help categorize what version of the app a
                    user was using.{' '}
                    <a
                        href="https://docs.highlight.run/reference#options"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about setting the version.
                    </a>
                </>
            ),
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Record Network Requests',
            valueDisplayValue: data?.session?.enable_recording_network_contents
                ? 'Enabled'
                : 'Disabled',
            renderType: 'string',
            valueInfoTooltipMessage: (
                <>
                    This specifies whether Highlight records the status codes,
                    headers, and bodies for XML/Fetch requests made in your app.{' '}
                    <a
                        href="https://docs.highlight.run/docs/recording-network-requests-and-responses"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about recording network requests and
                        responses.
                    </a>
                </>
            ),
        },
    ];

    if (data?.session?.city) {
        sessionData.push({
            keyDisplayValue: 'Location',
            valueDisplayValue: `${data?.session?.city}, ${data?.session?.state} ${data?.session?.postal}`,
            renderType: 'string',
        });
    }

    // Data exposed to Highlight employees.
    if (a_data?.admin?.email.includes('highlight.run')) {
        if (data?.session?.object_storage_enabled) {
            sessionData.push({
                keyDisplayValue: 'Session Size',
                valueDisplayValue: `${formatSize(data.session.payload_size)}`,
                renderType: 'string',
            });
        }
        sessionData.push({
            keyDisplayValue: 'Firstload Version',
            valueDisplayValue: data?.session?.client_version || 'Unknown',
            renderType: 'string',
        });
    }

    const userData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Identifer',
            valueDisplayValue: data?.session?.identifier || 'Not Set',
            valueInfoTooltipMessage: !data?.session?.identifier && (
                <>
                    Did you know that you can enrich sessions with additional
                    metadata? They'll show up here. You can{' '}
                    <a
                        href="https://docs.highlight.run/docs/identifying-users"
                        target="_blank"
                        rel="noreferrer"
                    >
                        learn more here
                    </a>
                    .
                </>
            ),
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Locale',
            valueDisplayValue: data?.session?.language || 'Unknown',
            renderType: 'string',
        },
    ];

    parsedFields?.forEach((field) => {
        userData.push({
            keyDisplayValue: field.name,
            valueDisplayValue: field.value,
            renderType: 'string',
        });
    });

    const deviceData: KeyValueTableRow[] = [];

    if (data?.session?.fingerprint) {
        deviceData.push({
            keyDisplayValue: 'Device ID',
            valueDisplayValue: (
                <Link
                    to={`/${organization_id}/sessions?${new URLSearchParams({
                        [SessionPageSearchParams.deviceId]: data.session.fingerprint.toString(),
                    }).toString()}`}
                >
                    #{data?.session?.fingerprint}
                </Link>
            ),
            renderType: 'string',
        });
    }

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
                        <KeyValueTable data={sessionData} />
                    </DataCard>
                    <DataCard title="User">
                        <KeyValueTable data={userData} />
                    </DataCard>

                    <DataCard title="Device">
                        <KeyValueTable data={deviceData} />
                    </DataCard>
                </>
            )}
        </div>
    );
};

export default MetadataPanel;
