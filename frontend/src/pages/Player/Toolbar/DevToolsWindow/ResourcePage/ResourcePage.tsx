import Input from '@components/Input/Input';
import { ErrorObject } from '@graph/schemas';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext';
import { useResourceOrErrorDetailPanel } from '@pages/Player/Toolbar/DevToolsWindow/ResourceOrErrorDetailPanel/ResourceOrErrorDetailPanel';
import { message } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import _ from 'lodash';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Skeleton from 'react-loading-skeleton';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import GoToButton from '../../../../../components/Button/GoToButton';
import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import { MillisToMinutesAndSeconds } from '../../../../../util/time';
import { formatTime } from '../../../../Home/components/KeyPerformanceIndicators/utils/utils';
import { ReplayerState, useReplayerContext } from '../../../ReplayerContext';
import devStyles from '../DevToolsWindow.module.scss';
import { getNetworkResourcesDisplayName, Option } from '../Option/Option';
import styles from './ResourcePage.module.scss';

export const ResourcePage = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const {
        state,
        session,
        pause,
        isPlayerReady,
        errors,
        replayer,
    } = useReplayerContext();
    const {
        setShowDevTools,
        setSelectedDevToolsTab,
    } = usePlayerConfiguration();
    const [options, setOptions] = useState<Array<string>>([]);
    const [currentOption, setCurrentOption] = useState('All');
    const [filterSearchTerm, setFilterSearchTerm] = useState('');
    const [currentResource, setCurrentResource] = useState(0);
    const [networkRange, setNetworkRange] = useState(0);
    const [
        isInteractingWithResources,
        setIsInteractingWithResources,
    ] = useState(false);
    const [allResources, setAllResources] = useState<
        Array<NetworkResource> | undefined
    >([]);

    const virtuoso = useRef<VirtuosoHandle>(null);
    const resourceErrorRequestHeader = new URLSearchParams(location.search).get(
        PlayerSearchParameters.resourceErrorRequestHeader
    );
    const { setResourcePanel, setErrorPanel } = useResourceOrErrorDetailPanel();

    const {
        resources: parsedResources,
        loadResources,
        resourcesLoading: loading,
    } = useResourcesContext();
    loadResources();

    useEffect(() => {
        const optionSet = new Set<string>();
        parsedResources?.forEach((r) => {
            if (!optionSet.has(r.initiatorType)) {
                optionSet.add(r.initiatorType);
            }
        });
        setOptions(['All', ...Array.from(optionSet)]);
    }, [parsedResources]);

    useEffect(() => {
        if (parsedResources) {
            setAllResources(
                parsedResources?.filter((r) => {
                    if (currentOption === 'All') {
                        return true;
                    } else if (currentOption === r.initiatorType) {
                        return true;
                    }
                    return false;
                }) ?? []
            );
        }
    }, [parsedResources, currentOption, options]);

    useEffect(() => {
        if (parsedResources.length > 0) {
            const start = parsedResources[0].startTime;
            const end = parsedResources[parsedResources.length - 1].responseEnd;
            setNetworkRange(end - start);
        }
    }, [parsedResources]);

    useEffect(() => {
        if (allResources?.length) {
            let msgIndex = 0;
            const relativeTime = time - startTime;
            let msgDiff: number = Math.abs(
                relativeTime - allResources[0].startTime
            );
            for (let i = 0; i < allResources.length; i++) {
                const currentDiff: number = Math.abs(
                    relativeTime - allResources[i].startTime
                );
                if (currentDiff < msgDiff) {
                    msgIndex = i;
                    msgDiff = currentDiff;
                }
            }
            if (currentResource !== msgIndex) {
                setCurrentResource(msgIndex);
            }
        }
    }, [allResources, startTime, time, currentResource]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const scrollFunction = useCallback(
        _.debounce((index: number) => {
            if (virtuoso.current) {
                virtuoso.current.scrollToIndex({
                    index,
                    align: 'center',
                    behavior: 'smooth',
                });
            }
        }, 1000 / 60),
        []
    );

    useEffect(() => {
        if (
            resourceErrorRequestHeader &&
            !loading &&
            !!session &&
            !!allResources &&
            !!errors &&
            errors.length > 0 &&
            isPlayerReady
        ) {
            const resource = findResourceWithMatchingHighlightHeader(
                resourceErrorRequestHeader,
                allResources
            );
            if (resource) {
                setResourcePanel(resource);
                pause(resource.startTime);
                scrollFunction(allResources.indexOf(resource));
            } else {
                setSelectedDevToolsTab('Errors');
                const firstError = errors[0];
                setErrorPanel(firstError);
                const startTime = replayer?.getMetaData().startTime;
                if (startTime && firstError.timestamp) {
                    const errorDateTime = new Date(firstError.timestamp);
                    const deltaMilliseconds =
                        errorDateTime.getTime() - startTime;
                    pause(deltaMilliseconds);
                }
                H.track('FailedToMatchHighlightResourceHeaderWithResource');
            }
        }
    }, [
        allResources,
        errors,
        isPlayerReady,
        loading,
        pause,
        replayer,
        resourceErrorRequestHeader,
        scrollFunction,
        session,
        setErrorPanel,
        setResourcePanel,
        setSelectedDevToolsTab,
        setShowDevTools,
    ]);

    useEffect(() => {
        if (!isInteractingWithResources && state === ReplayerState.Playing) {
            scrollFunction(currentResource);
        }
    }, [currentResource, scrollFunction, isInteractingWithResources, state]);

    const resourcesToRender = useMemo(() => {
        if (!allResources) {
            return [];
        }

        if (filterSearchTerm !== '') {
            return allResources.filter((resource) => {
                if (!resource.name) {
                    return false;
                }

                return resource.name
                    .toLocaleLowerCase()
                    .includes(filterSearchTerm.toLocaleLowerCase());
            });
        }

        return allResources;
    }, [allResources, filterSearchTerm]);

    return (
        <div className={styles.resourcePageWrapper}>
            <div className={devStyles.topBar}>
                <div className={styles.optionsWrapper}>
                    <div className={styles.optionsContainer}>
                        {options.map((o: string, i: number) => {
                            return (
                                <Option
                                    key={i.toString()}
                                    onSelect={() => setCurrentOption(o)}
                                    selected={o === currentOption}
                                    optionValue={o}
                                />
                            );
                        })}
                    </div>
                    <div className={styles.filterContainer}>
                        <Input
                            allowClear
                            placeholder="Filter"
                            value={filterSearchTerm}
                            onChange={(event) => {
                                setFilterSearchTerm(event.target.value);
                            }}
                            size="small"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.networkTableWrapper}>
                {loading ? (
                    <div className={devStyles.skeletonWrapper}>
                        <Skeleton
                            count={2}
                            style={{ height: 25, marginBottom: 11 }}
                        />
                    </div>
                ) : (
                    <>
                        <TimingCanvas />
                        <div className={styles.networkTopBar}>
                            <div className={styles.networkColumn}>Status</div>
                            <div className={styles.networkColumn}>Type</div>
                            <div className={styles.networkColumn}>Name</div>
                            <div
                                className={classNames(
                                    styles.networkColumn,
                                    styles.justifyEnd
                                )}
                            >
                                Time
                            </div>
                            <div
                                className={classNames(
                                    styles.networkColumn,
                                    styles.justifyEnd
                                )}
                            >
                                Size
                            </div>
                            <div
                                className={classNames(
                                    styles.networkColumn,
                                    styles.waterfall
                                )}
                            >
                                Waterfall
                            </div>
                        </div>
                        <div
                            id="networkStreamWrapper"
                            className={styles.networkStreamWrapper}
                        >
                            {resourcesToRender.length > 0 && session ? (
                                <Virtuoso
                                    onMouseEnter={() => {
                                        setIsInteractingWithResources(true);
                                    }}
                                    onMouseLeave={() => {
                                        setIsInteractingWithResources(false);
                                    }}
                                    ref={virtuoso}
                                    overscan={500}
                                    data={resourcesToRender}
                                    className={styles.virtuoso}
                                    itemContent={(index, resource) => {
                                        const requestId = getHighlightRequestId(
                                            resource
                                        );
                                        const error = errors.find(
                                            (e) => e.request_id === requestId
                                        );
                                        return (
                                            <ResourceRow
                                                key={index.toString()}
                                                resource={resource}
                                                networkRange={networkRange}
                                                currentResource={
                                                    currentResource
                                                }
                                                searchTerm={filterSearchTerm}
                                                onClickHandler={() => {
                                                    setResourcePanel(resource);
                                                }}
                                                hasError={!!error}
                                            />
                                        );
                                    }}
                                />
                            ) : resourcesToRender.length === 0 &&
                              filterSearchTerm !== '' ? (
                                <div className={styles.noDataContainer}>
                                    <p>
                                        No network resources matching '
                                        {filterSearchTerm}'
                                    </p>
                                </div>
                            ) : (
                                <div className={styles.noDataContainer}>
                                    <h3>
                                        There are no network recordings for this
                                        session.
                                    </h3>
                                    <p>
                                        If you expected to see data here, please
                                        make sure <code>networkRecording</code>{' '}
                                        is set to <code>true</code>. You can{' '}
                                        <a
                                            href="https://docs.highlight.run/api#w0-highlightoptions"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            learn more here
                                        </a>
                                        .
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const TimingCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvasNetworkWrapper}
        ></canvas>
    );
};

export type NetworkResource = PerformanceResourceTiming & {
    id: number;
    requestResponsePairs?: RequestResponsePair;
    errors?: ErrorObject[];
};

const ResourceRow = ({
    resource,
    networkRange,
    currentResource,
    searchTerm,
    onClickHandler,
    hasError,
}: {
    resource: NetworkResource;
    networkRange: number;
    currentResource: number;
    searchTerm: string;
    onClickHandler: () => void;
    hasError?: boolean;
}) => {
    const { pause } = useReplayerContext();
    const { detailedPanel } = usePlayerUIContext();
    const leftPaddingPercent = (resource.startTime / networkRange) * 100;
    const actualPercent = Math.max(
        ((resource.responseEnd - resource.startTime) / networkRange) * 100,
        0.1
    );
    const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent;
    const isCurrentResource = resource.id === currentResource;

    return (
        <div key={resource.id.toString()} onClick={onClickHandler}>
            <div
                className={classNames(styles.networkRow, {
                    [styles.current]: isCurrentResource,
                    [styles.failedResource]:
                        hasError ||
                        (resource.requestResponsePairs?.response.status &&
                            (resource.requestResponsePairs.response.status ===
                                0 ||
                                resource.requestResponsePairs.response.status >=
                                    400)),
                    [styles.showingDetails]:
                        detailedPanel?.id === resource.id.toString(),
                })}
            >
                {isCurrentResource && (
                    <div className={styles.currentIndicator} />
                )}
                <div className={styles.typeSection}>
                    {resource.requestResponsePairs?.response.status ?? 200}
                </div>
                <div className={styles.typeSection}>
                    {getNetworkResourcesDisplayName(resource.initiatorType)}
                </div>
                <Tooltip title={resource.name}>
                    <TextHighlighter
                        className={styles.nameSection}
                        searchWords={[searchTerm]}
                        autoEscape={true}
                        textToHighlight={resource.name}
                    />
                </Tooltip>
                <div
                    className={classNames(
                        styles.typeSection,
                        styles.rightAlign
                    )}
                >
                    {resource.requestResponsePairs?.response.status === 0
                        ? `-`
                        : `${formatTime(
                              resource.responseEnd - resource.startTime
                          )}`}
                </div>
                <div
                    className={classNames(
                        styles.typeSection,
                        styles.rightAlign
                    )}
                >
                    {resource.requestResponsePairs?.response.size ? (
                        formatSize(resource.requestResponsePairs.response.size)
                    ) : resource.requestResponsePairs?.response.status === 0 ? (
                        '-'
                    ) : resource.requestResponsePairs?.urlBlocked ||
                      resource.transferSize == null ? (
                        '-'
                    ) : resource.transferSize === 0 ? (
                        'Cached'
                    ) : (
                        <>{formatSize(resource.transferSize)}</>
                    )}
                </div>
                <div className={styles.timingBarWrapper}>
                    <div
                        style={{
                            width: `${leftPaddingPercent}%`,
                        }}
                        className={styles.timingBarEmptySection}
                    />
                    <div
                        className={styles.timingBar}
                        style={{
                            width: `${actualPercent}%`,
                            zIndex: 100,
                        }}
                    />
                    <div
                        style={{
                            width: `${rightPaddingPercent}%`,
                        }}
                        className={styles.timingBarEmptySection}
                    />
                </div>
                <GoToButton
                    className={styles.goToButton}
                    onClick={(e) => {
                        pause(resource.startTime);
                        e.stopPropagation();

                        message.success(
                            `Changed player time to when ${getNetworkResourcesDisplayName(
                                resource.initiatorType
                            )} request started at ${MillisToMinutesAndSeconds(
                                resource.startTime
                            )}.`
                        );
                    }}
                />
            </div>
        </div>
    );
};
interface Request {
    url: string;
    verb: string;
    headers: Headers;
    body: any;
}

interface Response {
    status: number;
    headers: any;
    body: any;
    /** Number of Bytes transferred over the network. */
    size?: number;
}

interface RequestResponsePair {
    request: Request;
    response: Response;
    /** Whether this URL matched a `urlToBlock` so the contents should not be recorded. */
    urlBlocked: boolean;
}

/**
 * Formats bytes to the short form of KB and MB.
 */
export const formatSize = (bytes: number) => {
    if (bytes < 1024) {
        return `${roundOff(bytes)} B`;
    }
    if (bytes < 1024 ** 2) {
        return `${roundOff(bytes / 1024)} KB`;
    }
    return `${roundOff(bytes / 1024 ** 2)} MB`;
};

const roundOff = (value: number, decimal = 1) => {
    const base = 10 ** decimal;
    return Math.round(value * base) / base;
};

export const findResourceWithMatchingHighlightHeader = (
    headerValue: string,
    resources: NetworkResource[]
) => {
    return resources.find(
        (resource) => getHighlightRequestId(resource) === headerValue
    );
};

export const getHighlightRequestId = (resource: NetworkResource) => {
    // @ts-expect-error
    return resource.requestResponsePairs?.request?.id;
};
