import React, { useState, useContext, useEffect } from 'react';
import { Modal, Skeleton } from 'antd';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import { ExpandedResourceContext } from '../ResourceContentsContext/ResourceContentsContext';
import styles from './ResourceModal.module.css';
import { NetworkResourceContent } from '../../../../../../util/shared-types';

export const ResourceModal = () => {
    const { session_id } = useParams();
    const { setExpandedResource, expandedResource } = useContext(
        ExpandedResourceContext
    );
    const [networkResourceContent, setNetworkResourceContent] = useState<
        NetworkResourceContent | undefined
    >(undefined);
    const { loading, error, data } = useQuery<
        {
            resourceContents: NetworkResourceContent[];
        },
        { session_id: number }
    >(
        gql`
            query ResourceContents($session_id: ID!) {
                resourceContents(session_id: $session_id)
            }
        `,
        { variables: { session_id } }
    );
    useEffect(() => {
        if (data?.resourceContents) {
            setNetworkResourceContent(
                data?.resourceContents.find(
                    (c) => c.request?.url === expandedResource?.name
                )
            );
        }
    }, [data]);
    console.log('all', data?.resourceContents);
    console.log('content', networkResourceContent);
    const { duration, decodedBodySize, name, initiatorType, transferSize } =
        expandedResource || {};
    return (
        <Modal
            visible
            footer={null}
            onCancel={() => setExpandedResource(undefined)}
            width={550}
        >
            <div className={styles.modalContainer}>
                {loading ? (
                    <Skeleton />
                ) : (
                    <>
                        <div className={styles.title}>Resource</div>
                        <div className={styles.subTitle}>Summary</div>
                        <div className={styles.detailsContainer}>
                            <div className={styles.detailsRow}>
                                <div className={styles.detailsKey}>URL</div>
                                <a
                                    href={name}
                                    target={'_blank'}
                                    className={styles.detailsValue}
                                    style={{ color: '#5629C6' }}
                                >
                                    {name}
                                </a>
                            </div>
                            {duration ? (
                                <div className={styles.detailsRow}>
                                    <div className={styles.detailsKey}>
                                        Time
                                    </div>
                                    <div className={styles.detailsValue}>
                                        {duration.toFixed(2) + 'ms'}
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                            <div className={styles.detailsRow}>
                                <div className={styles.detailsKey}>
                                    Transfer Size
                                </div>
                                <div className={styles.detailsValue}>
                                    {transferSize}
                                </div>
                            </div>
                            <div className={styles.detailsRow}>
                                <div className={styles.detailsKey}>
                                    Body Size
                                </div>
                                <div className={styles.detailsValue}>
                                    {decodedBodySize}
                                </div>
                            </div>
                            {duration ? (
                                <div className={styles.detailsRow}>
                                    <div className={styles.detailsKey}>
                                        Type
                                    </div>
                                    <div className={styles.detailsValue}>
                                        {initiatorType}
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className={styles.title}>Request</div>
                        <div className={styles.subTitle}>Headers</div>
                        <div className={styles.detailsContainer}>
                            <div className={styles.detailsRow}>hello</div>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};
