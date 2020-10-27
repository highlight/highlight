import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';

import devStyles from '../DevToolsWindow.module.css';
import styles from './ResourcePage.module.css';

export const ResourcePage = ({ time }: { time: number }) => {
    const { session_id } = useParams<{ session_id: string }>();
    const [options, setOptions] = useState<Array<string>>([]);
    const [optionIndex, setOptionIndex] = useState(0);
    const [networkMeta, setNetworkMeta] = useState<{
        start: number;
        end: number;
        total: number;
    }>({ start: 0, end: 1, total: 1 });
    const [parsedResources, setParsedResources] = useState<
        Array<PerformanceResourceTiming>
    >([]);
    const { data } = useQuery<
        { resources: PerformanceResourceTiming[] },
        { session_id: string }
    >(
        gql`
            query GetResources($session_id: ID!) {
                resources(session_id: $session_id)
            }
        `,
        { variables: { session_id } }
    );

    const rawResources = data?.resources;

    useEffect(() => {
        const optionSet = new Set<string>();
        rawResources?.map((r) => {
            if (!optionSet.has(r.initiatorType)) {
                optionSet.add(r.initiatorType);
            }
        });
        setOptions(['All', ...Array.from(optionSet)]);
    }, [rawResources]);

    useEffect(() => {
        if (rawResources) {
            setParsedResources(
                rawResources.filter((r) => {
                    if (options[optionIndex] === 'All') {
                        return true;
                    } else if (options[optionIndex] === r.initiatorType) {
                        return true;
                    }
                    return false;
                })
            );
        }
    }, [rawResources, optionIndex, options]);

    useEffect(() => {
        if (rawResources) {
            const start = rawResources[0].startTime;
            const end = rawResources[rawResources.length - 1].responseEnd;
            setNetworkMeta({
                start,
                end,
                total: end - start,
            });
        }
    }, [rawResources]);

    return (
        <>
            <div className={devStyles.topBar}>
                <div className={devStyles.optionsWrapper}>
                    {options.map((o: string, i: number) => {
                        return (
                            <div
                                className={devStyles.option}
                                onClick={() => setOptionIndex(i)}
                                style={{
                                    backgroundColor:
                                        optionIndex === i
                                            ? '#5629c6'
                                            : '#f2eefb',
                                    color:
                                        optionIndex === i ? 'white' : '#5629c6',
                                }}
                            >
                                {o.toUpperCase()}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className={styles.networkTopBar}>
                <div className={styles.networkColumn}>TYPE</div>
                <div className={styles.networkColumn}>NAME</div>
                <div className={styles.networkColumn}>TIME</div>
                <div className={styles.networkTimingColumn}>
                    <div className={styles.networkColumn}>0ms</div>
                    <div className={styles.networkColumn}>
                        {(networkMeta.total / 2).toFixed(1)}ms
                    </div>
                    <div className={styles.networkColumn}>
                        {networkMeta.total.toFixed(1)}ms
                    </div>
                </div>
            </div>
            <div
                id="networkStreamWrapper"
                className={devStyles.devToolsStreamWrapper}
            >
                {parsedResources.length ? (
                    <>
                        {parsedResources.map((p: PerformanceResourceTiming) => {
                            const leftPaddingPercent =
                                ((p.startTime - networkMeta.start) /
                                    networkMeta.total) *
                                100;
                            const actualPercent = Math.max(
                                ((p.responseEnd - p.startTime) /
                                    networkMeta.total) *
                                    100,
                                0.1
                            );
                            const rightPaddingPercent =
                                100 - actualPercent - leftPaddingPercent;
                            return (
                                <div className={styles.networkRow}>
                                    <div className={styles.typeSection}>
                                        {p.initiatorType}
                                    </div>
                                    <Tooltip title={p.name}>
                                        <div className={styles.nameSection}>
                                            {p.name}
                                        </div>
                                    </Tooltip>
                                    <div>
                                        {(p.responseEnd - p.startTime).toFixed(
                                            2
                                        )}
                                    </div>
                                    <div className={styles.timingBarWrapper}>
                                        <div
                                            style={{
                                                width: `${leftPaddingPercent}%`,
                                            }}
                                            className={
                                                styles.timingBarEmptySection
                                            }
                                        />
                                        <div
                                            className={styles.timingBar}
                                            style={{
                                                width: `${actualPercent}%`,
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: `${rightPaddingPercent}%`,
                                            }}
                                            className={
                                                styles.timingBarEmptySection
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    <div className={devStyles.emptySection}>
                        No network resources.
                    </div>
                )}
            </div>
        </>
    );
};
