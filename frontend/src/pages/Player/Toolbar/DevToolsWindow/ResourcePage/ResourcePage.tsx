import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Option, DevToolsSelect } from '../Option/Option';
import { scroller, Element } from 'react-scroll';
import { Skeleton } from 'antd';
import { ResourceContents } from './ResourceContents/ResourceContents';
import { ExpandedResourceContext } from './ResourceContentsContext/ResourceContentsContext';
import { ResourceModal } from './ResourceModal/ResourceModal';

import devStyles from '../DevToolsWindow.module.css';
import styles from './ResourcePage.module.css';
import { Modal, message } from 'antd';

export const ResourcePage = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { session_id } = useParams<{ session_id: string }>();
    const [options, setOptions] = useState<Array<string>>([]);
    const [expandedResource, setExpandedResource] = useState<
        undefined | PerformanceResourceTiming
    >(undefined);
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
        <ExpandedResourceContext.Provider
            value={{ expandedResource, setExpandedResource }}
        >
            {expandedResource && <ResourceModal />}
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
                                    const isCurrent = p.id === currentResource;
                                    return (
                                        <Element
                                            name={p.id.toString()}
                                            key={p.id.toString()}
                                        >
                                            <ResourceContents
                                                current={isCurrent}
                                                resource={p}
                                                range={networkRange}
                                            />
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
        </ExpandedResourceContext.Provider>
    );
};
