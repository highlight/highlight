import React, { useState, useEffect, useContext } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Tooltip } from 'antd';
import { Option, DevToolsSelect } from '../Option/Option';
import { scroller, Element } from 'react-scroll';
import { Skeleton } from 'antd';

import devStyles from '../DevToolsWindow.module.scss';
import styles from './ResourcePage.module.scss';
import { DemoContext } from '../../../../../DemoContext';

export const ResourcePage = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { session_id } = useParams<{ session_id: string }>();
    const { demo } = useContext(DemoContext);
    const [options, setOptions] = useState<Array<string>>([]);
    const [currentOption, setCurrentOption] = useState('All');
    const [currentResource, setCurrentResource] = useState(0);
    const [networkRange, setNetworkRange] = useState(0);
    const [currentResources, setCurrentResources] = useState<
        Array<PerformanceResourceTiming & { id: number }>
    >([]);
    const [parsedResources, setParsedResources] = useState<
        Array<PerformanceResourceTiming & { id: number }>
    >([]);
    const { data, loading } = useQuery<
        { resources: PerformanceResourceTiming[] },
        { session_id: string }
    >(
        gql`
            query GetResources($session_id: ID!) {
                resources(session_id: $session_id)
            }
        `,
        {
            variables: {
                session_id: demo
                    ? process.env.REACT_APP_DEMO_SESSION ?? ''
                    : session_id,
            },
            context: { headers: { 'Highlight-Demo': demo } },
        }
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
                    if (currentOption === 'All') {
                        return true;
                    } else if (currentOption === r.initiatorType) {
                        return true;
                    }
                    return false;
                })
            );
        }
    }, [parsedResources, rawResources, currentOption, options]);

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
                    {options.map((o: string) => {
                        return (
                            <Option
                                onSelect={() => setCurrentOption(o)}
                                selected={o === currentOption}
                                optionValue={o}
                            />
                        );
                    })}
                </div>
                <DevToolsSelect isConsole={false} />
            </div>
            <div className={styles.networkTableWrapper}>
                {loading ? (
                    <div className={devStyles.skeletonWrapper}>
                        <Skeleton active />
                    </div>
                ) : currentResources.length ? (
                    <>
                        <div className={styles.networkTopBar}>
                            <div className={styles.networkColumn}>TYPE</div>
                            <div className={styles.networkColumn}>NAME</div>
                            <div className={styles.networkColumn}>TIME</div>
                            <div className={styles.networkColumn}>TIMING</div>
                        </div>
                        <div
                            id="networkStreamWrapper"
                            className={styles.networkStreamWrapper}
                        >
                            {currentResources.map(
                                (
                                    p: PerformanceResourceTiming & {
                                        id: number;
                                    }
                                ) => {
                                    const leftPaddingPercent =
                                        (p.startTime / networkRange) * 100;
                                    const actualPercent = Math.max(
                                        ((p.responseEnd - p.startTime) /
                                            networkRange) *
                                        100,
                                        0.1
                                    );
                                    const rightPaddingPercent =
                                        100 -
                                        actualPercent -
                                        leftPaddingPercent;
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
                                                <div
                                                    className={
                                                        styles.typeSection
                                                    }
                                                >
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
                                                        p.responseEnd -
                                                        p.startTime
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
                                                        className={
                                                            styles.timingBar
                                                        }
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
                        </div>
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
