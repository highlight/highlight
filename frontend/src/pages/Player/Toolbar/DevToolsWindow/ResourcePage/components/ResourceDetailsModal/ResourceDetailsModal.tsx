import React from 'react';

import { useAuthContext } from '../../../../../../../AuthContext';
import DataCard from '../../../../../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../../../../../components/KeyValueTable/KeyValueTable';
import Modal from '../../../../../../../components/Modal/Modal';
import Space from '../../../../../../../components/Space/Space';
import { formatTime } from '../../../../../../Home/components/KeyPerformanceIndicators/utils/utils';
import { getNetworkResourcesDisplayName } from '../../../Option/Option';
import { formatSize, NetworkResource } from '../../ResourcePage';
import styles from './ResourceDetailsModal.module.scss';

interface Props {
    selectedNetworkResource?: NetworkResource;
    onCloseHandler: () => void;
    networkRecordingEnabledForSession: boolean;
}

const ResourceDetailsModal = ({
    selectedNetworkResource,
    onCloseHandler,
    networkRecordingEnabledForSession,
}: Props) => {
    const { isHighlightAdmin } = useAuthContext();

    const generalData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Request URL',
            valueDisplayValue: selectedNetworkResource?.name || 'Unknown',
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Method',
            valueDisplayValue:
                selectedNetworkResource?.requestResponsePairs?.request.verb ||
                'GET',
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Status',
            valueDisplayValue:
                selectedNetworkResource?.requestResponsePairs?.response
                    .status ?? '200',
            valueInfoTooltipMessage:
                selectedNetworkResource?.requestResponsePairs?.response
                    .status === 0 &&
                'This request was blocked on the client. The usually reason is a browser extension (like an ad blocker) blocked the request.',
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Time',
            valueDisplayValue:
                selectedNetworkResource?.responseEnd &&
                selectedNetworkResource?.startTime &&
                formatTime(
                    selectedNetworkResource.responseEnd -
                        selectedNetworkResource.startTime
                ),
            renderType: 'string',
        },
        {
            keyDisplayValue: 'Type',
            valueDisplayValue: getNetworkResourcesDisplayName(
                selectedNetworkResource?.initiatorType || ''
            ),
            renderType: 'string',
        },
    ];

    const requestHeadersData: KeyValueTableRow[] = [];
    const requestPayloadData: KeyValueTableRow[] = [];
    const responseHeadersData: KeyValueTableRow[] = [];
    const responsePayloadData: KeyValueTableRow[] = [];

    if (selectedNetworkResource?.requestResponsePairs) {
        const {
            request,
            response,
            urlBlocked,
        } = selectedNetworkResource.requestResponsePairs;

        if (urlBlocked) {
            generalData.push({
                keyDisplayValue: 'Recording Blocked',
                valueDisplayValue: (
                    <>
                        <span>
                            The headers and body of this request was blocked.
                            The URL matched one a URL that is known to contain
                            secrets/passwords. You can{' '}
                            <a
                                href="https://docs.highlight.run/docs/recording-network-requests-and-responses#overview"
                                target="_blank"
                                rel="noreferrer"
                            >
                                learn more here.
                            </a>
                        </span>
                    </>
                ),
                renderType: 'string',
            });
        }

        if (request.headers) {
            const requestHeaderKeys = Object.keys(request.headers);

            requestHeaderKeys.forEach((key) => {
                requestHeadersData.push({
                    keyDisplayValue: key,
                    // @ts-expect-error
                    valueDisplayValue: request.headers[key],
                    renderType: 'string',
                });
            });
        }

        if (request.body) {
            try {
                const parsedRequestBody = JSON.parse(request.body);

                Object.keys(parsedRequestBody).forEach((key) => {
                    const renderType =
                        typeof parsedRequestBody[key] === 'object'
                            ? 'json'
                            : 'string';
                    requestPayloadData.push({
                        keyDisplayValue: key,
                        valueDisplayValue:
                            renderType === 'string'
                                ? parsedRequestBody[key]?.toString()
                                : JSON.parse(
                                      JSON.stringify(parsedRequestBody[key])
                                  ),
                        renderType,
                    });
                });
            } catch {
                requestPayloadData.push({
                    keyDisplayValue: 'body',
                    valueDisplayValue: request.body,
                    renderType: 'string',
                });
            }
        }

        if (response.headers) {
            Object.keys(response.headers).forEach((key) => {
                responseHeadersData.push({
                    keyDisplayValue: key,
                    valueDisplayValue: response.headers[key]?.toString(),
                    renderType: 'string',
                });
            });
        }

        if (response.size) {
            responsePayloadData.push({
                keyDisplayValue: 'Size',
                valueDisplayValue: formatSize(response.size),
                renderType: 'string',
            });
        }

        if (response.body) {
            try {
                const parsedResponseBody = JSON.parse(response.body);
                Object.keys(parsedResponseBody).forEach((key) => {
                    const renderType =
                        typeof parsedResponseBody[key] === 'object'
                            ? 'json'
                            : 'string';

                    responsePayloadData.push({
                        keyDisplayValue: key,
                        valueDisplayValue:
                            renderType === 'string'
                                ? parsedResponseBody[key]?.toString()
                                : parsedResponseBody[key],
                        renderType,
                    });
                });
            } catch (e) {
                responsePayloadData.push({
                    keyDisplayValue: 'boba',
                    valueDisplayValue: response.body,
                    renderType: 'string',
                });
            }
        }
    }

    return (
        <Modal
            visible={!!selectedNetworkResource}
            onCancel={onCloseHandler}
            title="Network Request"
            width={'90%'}
        >
            <section className={styles.modalContentContainer}>
                <Space size="large" direction="vertical">
                    <DataCard title="General" fullWidth>
                        <KeyValueTable data={generalData} />
                    </DataCard>

                    {((isHighlightAdmin &&
                        selectedNetworkResource?.initiatorType === 'fetch') ||
                        selectedNetworkResource?.initiatorType ===
                            'xmlhttprequest') &&
                        !selectedNetworkResource.requestResponsePairs
                            ?.urlBlocked && (
                            <>
                                <DataCard title="Request Headers" fullWidth>
                                    <KeyValueTable
                                        data={requestHeadersData}
                                        noDataMessage={
                                            !networkRecordingEnabledForSession ? (
                                                <NetworkRecordingEducationMessage />
                                            ) : undefined
                                        }
                                    />
                                </DataCard>

                                <DataCard title="Request Payload" fullWidth>
                                    <KeyValueTable
                                        data={requestPayloadData}
                                        noDataMessage={
                                            !networkRecordingEnabledForSession ? (
                                                <NetworkRecordingEducationMessage />
                                            ) : undefined
                                        }
                                    />
                                </DataCard>

                                <DataCard title="Response Headers" fullWidth>
                                    <KeyValueTable
                                        data={responseHeadersData}
                                        noDataMessage={
                                            !networkRecordingEnabledForSession ? (
                                                <NetworkRecordingEducationMessage />
                                            ) : undefined
                                        }
                                    />
                                </DataCard>

                                <DataCard title="Response Payload" fullWidth>
                                    <KeyValueTable
                                        data={responsePayloadData}
                                        noDataMessage={
                                            !networkRecordingEnabledForSession ? (
                                                <NetworkRecordingEducationMessage />
                                            ) : undefined
                                        }
                                    />
                                </DataCard>
                            </>
                        )}
                </Space>
            </section>
        </Modal>
    );
};

export default ResourceDetailsModal;

const NetworkRecordingEducationMessage = () => (
    <div className={styles.noDataMessageContainer}>
        <p>
            <code>recordHeadersAndBody</code> is disabled. If you would like to
            see XHR/Fetch headers and bodies you will need to enable{' '}
            <code>recordHeadersAndBody</code>.
        </p>
        <p>
            You can learn more about this and about the security/privacy
            implications{' '}
            <a
                target="_blank"
                rel="noreferrer"
                href="https://docs.highlight.run/docs/recording-network-requests-and-responses"
            >
                here
            </a>
            .
        </p>
    </div>
);
