import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import { scroller, Element } from 'react-scroll';

import devStyles from '../DevToolsWindow.module.css';
import styles from './ResourcePage.module.css';

export const ResourcePage = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { session_id } = useParams<{ session_id: string }>();
    const [options, setOptions] = useState<Array<string>>([]);
    const [optionIndex, setOptionIndex] = useState(0);
    const [currentResource, setCurrentResource] = useState(0);
    const [networkRange, setNetworkRange] = useState(0);
    const [currentResources, setCurrentResources] = useState<
        Array<PerformanceResourceTiming & { id: number }>
    >([]);
    const [parsedResources, setParsedResources] = useState<
        Array<PerformanceResourceTiming & { id: number }>
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
        if (rawResources) {
            setParsedResources(
                rawResources.map((r, i) => {
                    return { ...r, id: i };
                })
            );
        }
    }, [rawResources]);

    useEffect(() => {
        if (rawResources) {
            setCurrentResources(
                parsedResources.filter((r) => {
                    if (options[optionIndex] === 'All') {
                        return true;
                    } else if (options[optionIndex] === r.initiatorType) {
                        return true;
                    }
                    return false;
                })
            );
        }
    }, [parsedResources, rawResources, optionIndex, options]);

    useEffect(() => {
        if (rawResources) {
            const start = rawResources[0].startTime;
            const end = rawResources[rawResources.length - 1].responseEnd;
            setNetworkRange(end - start);
        }
    }, [rawResources]);

    // Logic for scrolling to current entry.
    useEffect(() => {
        if (currentResources?.length) {
            var msgIndex: number = 0;
            const relativeTime = time - startTime;
            var msgDiff: number = Math.abs(
                relativeTime - currentResources[0].startTime
            );
            for (var i = 0; i < currentResources.length; i++) {
                const currentDiff: number = Math.abs(
                    relativeTime - currentResources[i].startTime
                );
                if (currentDiff < msgDiff) {
                    msgIndex = i;
                    msgDiff = currentDiff;
                }
            }
            if (currentResource !== msgIndex) {
                setCurrentResource(msgIndex);
                scroller.scrollTo(msgIndex.toString(), {
                    smooth: true,
                    containerId: 'networkStreamWrapper',
                    spy: true,
                });
            }
        }
    }, [currentResources, startTime, time, currentResource]);

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
                        {(networkRange / 2).toFixed(1)}ms
                    </div>
                    <div className={styles.networkColumn}>
                        {networkRange.toFixed(1)}ms
                    </div>
                </div>
            </div>
            <div
                id="networkStreamWrapper"
                className={devStyles.devToolsStreamWrapper}
            >
                {currentResources.length ? (
                    <>
                        {currentResources.map(
                            (p: PerformanceResourceTiming & { id: number }) => {
                                const leftPaddingPercent =
                                    (p.startTime / networkRange) * 100;
                                const actualPercent = Math.max(
                                    ((p.responseEnd - p.startTime) /
                                        networkRange) *
                                        100,
                                    0.1
                                );
                                const rightPaddingPercent =
                                    100 - actualPercent - leftPaddingPercent;
                                return (
                                    <Element
                                        name={p.id.toString()}
                                        key={p.id.toString()}
                                    >
                                        <div
                                            style={{
                                                color:
                                                    p.id === currentResource
                                                        ? 'black'
                                                        : '#808080',
                                                fontWeight:
                                                    p.id === currentResource
                                                        ? 400
                                                        : 300,
                                            }}
                                            className={styles.networkRow}
                                        >
                                            <div className={styles.typeSection}>
                                                {p.initiatorType}
                                            </div>
                                            <Tooltip title={p.name}>
                                                <div
                                                    className={
                                                        styles.nameSection
                                                    }
                                                >
                                                    {p.name}
                                                </div>
                                            </Tooltip>
                                            <div>
                                                {(
                                                    p.responseEnd - p.startTime
                                                ).toFixed(2)}
                                            </div>
                                            <div
                                                className={
                                                    styles.timingBarWrapper
                                                }
                                            >
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
                                    </Element>
                                );
                            }
                        )}
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
