import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import { useAuthContext } from '../../../authentication/AuthContext';
import DataCard from '../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../components/KeyValueTable/KeyValueTable';
import { EmptySessionsSearchParams } from '../../Sessions/EmptySessionsSearchParams';
import { useSearchContext } from '../../Sessions/SearchContext/SearchContext';
import { useReplayerContext } from '../ReplayerContext';
import { formatSize } from '../Toolbar/DevToolsWindow/ResourcePage/ResourcePage';
import styles from './MetadataPanel.module.scss';

type Field = {
    type: string;
    name: string;
    value: string;
};

const MetadataPanel = () => {
    const { session } = useReplayerContext();
    const {
        setSearchParams,
        setSegmentName,
        setSelectedSegment,
    } = useSearchContext();
    const { isHighlightAdmin } = useAuthContext();

    const [parsedFields, setParsedFields] = useState<Field[]>([]);

    useEffect(() => {
        const fields = session?.fields?.filter((f) => {
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
    }, [session?.fields]);

    const sessionData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Environment',
            valueDisplayValue: session?.environment || 'Production',
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
            valueDisplayValue: session?.app_version || 'App Version Not Set',
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
            keyDisplayValue: 'Strict Privacy',
            valueDisplayValue: session?.enable_strict_privacy
                ? 'Enabled'
                : 'Disabled',
            renderType: 'string',
            valueInfoTooltipMessage: (
                <>
                    {session?.enable_strict_privacy
                        ? 'Text and images in this session are obfuscated.'
                        : 'This session is recording all content on the page.'}{' '}
                    <a
                        href="https://docs.highlight.run/docs/privacy#overview"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Learn more about Strict Privacy Mode.
                    </a>
                </>
            ),
        },
        {
            keyDisplayValue: 'Record Network Requests',
            valueDisplayValue: session?.enable_recording_network_contents
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

    if (session?.city) {
        sessionData.push({
            keyDisplayValue: 'Location',
            valueDisplayValue: `${session?.city}, ${session?.state} ${session?.postal}`,
            renderType: 'string',
        });
    }

    // Data exposed to Highlight employees.
    if (isHighlightAdmin) {
        if (session?.object_storage_enabled) {
            sessionData.push({
                keyDisplayValue: 'Session Size',
                valueDisplayValue: `${formatSize(session.payload_size)}`,
                renderType: 'string',
            });
        }
        sessionData.push({
            keyDisplayValue: 'Firstload Version',
            valueDisplayValue: session?.client_version || 'Unknown',
            renderType: 'string',
        });
    }

    const userData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Identifer',
            valueDisplayValue: session?.identifier || 'Not Set',
            valueInfoTooltipMessage: !session?.identifier && (
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
            valueDisplayValue: session?.language || 'Unknown',
            renderType: 'string',
        },
    ];

    parsedFields?.forEach((field) => {
        if (field.name !== 'avatar') {
            userData.push({
                keyDisplayValue: field.name,
                valueDisplayValue: field.value,
                renderType: 'string',
            });
        }
    });

    const deviceData: KeyValueTableRow[] = [];

    if (session?.fingerprint) {
        deviceData.push({
            keyDisplayValue: 'Device ID',
            valueDisplayValue: (
                <Link
                    to={window.location.pathname}
                    onClick={() => {
                        message.success(
                            `Showing sessions created by device #${session.fingerprint}`
                        );
                        setSegmentName(null);
                        setSelectedSegment(undefined);
                        setSearchParams({
                            ...EmptySessionsSearchParams,
                            device_id: session.fingerprint?.toString(),
                        });
                    }}
                >
                    #{session?.fingerprint}
                </Link>
            ),
            renderType: 'string',
        });
    }

    return (
        <div className={styles.metadataPanel}>
            {!session ? (
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
