import React from 'react';

import DataCard from '../../../../../../../components/DataCard/DataCard';
import KeyValueTable, {
    KeyValueTableRow,
} from '../../../../../../../components/KeyValueTable/KeyValueTable';
import Modal from '../../../../../../../components/Modal/Modal';
import Space from '../../../../../../../components/Space/Space';
import useAdminRole from '../../../../../../../hooks/useAdminRole/useAdminRole';
import { formatShortTime } from '../../../../../../Home/components/KeyPerformanceIndicators/utils/utils';
import { getNetworkResourcesDisplayName } from '../../../Option/Option';
import { formatSize, NetworkResource } from '../../ResourcePage';
import styles from './ResourceDetailsModal.module.scss';

interface Props {
    selectedNetworkResource?: NetworkResource;
    onCloseHandler: () => void;
}

const ResourceDetailsModal = ({
    selectedNetworkResource,
    onCloseHandler,
}: Props) => {
    const { isHighlightAdmin } = useAdminRole();

    const generalData: KeyValueTableRow[] = [
        {
            keyDisplayValue: 'Request URL',
            valueDisplayValue: selectedNetworkResource?.name || 'Unknown',
        },
        {
            keyDisplayValue: 'Method',
            valueDisplayValue:
                selectedNetworkResource?.requestResponsePairs?.request.verb ||
                'GET',
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
        },
        {
            keyDisplayValue: 'Time',
            valueDisplayValue:
                selectedNetworkResource?.responseEnd &&
                selectedNetworkResource?.startTime &&
                formatShortTime(
                    (selectedNetworkResource.responseEnd -
                        selectedNetworkResource.startTime) /
                        1000,
                    ['ms'],
                    ' ',
                    2
                ),
        },
        {
            keyDisplayValue: 'Type',
            valueDisplayValue: getNetworkResourcesDisplayName(
                selectedNetworkResource?.initiatorType || ''
            ),
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
        } = selectedNetworkResource.requestResponsePairs;

        if (request.headers) {
            const requestHeaderKeys = Object.keys(request.headers);

            requestHeaderKeys.forEach((key) => {
                requestHeadersData.push({
                    keyDisplayValue: key,
                    // @ts-expect-error
                    valueDisplayValue: request.headers[key],
                });
            });
        }

        if (request.body) {
            const parsedRequestBody = JSON.parse(request.body);

            // TODO: Render the parsedBody as a nested JSON viewer.
            Object.keys(parsedRequestBody).forEach((key) => {
                requestPayloadData.push({
                    keyDisplayValue: key,
                    valueDisplayValue: parsedRequestBody[key]?.toString(),
                });
            });
        }

        if (response.headers) {
            Object.keys(response.headers).forEach((key) => {
                responseHeadersData.push({
                    keyDisplayValue: key,
                    valueDisplayValue: response.headers[key]?.toString(),
                });
            });
        }

        if (response.size) {
            responsePayloadData.push({
                keyDisplayValue: 'Size',
                valueDisplayValue: formatSize(response.size),
            });
        }

        if (response.body) {
            const parsedResponseBody = JSON.parse(response.body);
            // TODO: Render the parsedBody as a nested JSON viewer.
            Object.keys(parsedResponseBody).forEach((key) => {
                responsePayloadData.push({
                    keyDisplayValue: key,
                    valueDisplayValue: parsedResponseBody[key]?.toString(),
                });
            });
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

                    {(isHighlightAdmin &&
                        selectedNetworkResource?.initiatorType === 'fetch') ||
                        (selectedNetworkResource?.initiatorType ===
                            'xmlhttprequest' && (
                            <>
                                <DataCard title="Request Headers" fullWidth>
                                    <KeyValueTable
                                        data={requestHeadersData}
                                        noDataMessage={<NoDataMessage />}
                                    />
                                </DataCard>

                                <DataCard title="Request Payload" fullWidth>
                                    <KeyValueTable
                                        data={requestPayloadData}
                                        noDataMessage={<NoDataMessage />}
                                    />
                                </DataCard>

                                <DataCard title="Response Headers" fullWidth>
                                    <KeyValueTable
                                        data={responseHeadersData}
                                        noDataMessage={<NoDataMessage />}
                                    />
                                </DataCard>

                                <DataCard title="Response Payload" fullWidth>
                                    <KeyValueTable
                                        data={responsePayloadData}
                                        noDataMessage={<NoDataMessage />}
                                    />
                                </DataCard>
                            </>
                        ))}
                </Space>
            </section>
        </Modal>
    );
};

export default ResourceDetailsModal;

const NoDataMessage = () => (
    <div className={styles.noDataMessageContainer}>
        <p>
            <code>enableNetworkHeadersAndBodyRecording</code> is disabled. If
            you would like to see XHR/Fetch headers and bodies you will need to
            enable <code>enableNetworkHeadersAndBodyRecording</code>.
        </p>
        <p>
            You can learn more about this and about the security/privacy
            implications{' '}
            <a
                target="_blank"
                rel="noreferrer"
                href="https://docs.highlight.run/docs/xhr-fetch-recording"
            >
                here
            </a>
            .
        </p>
    </div>
);
