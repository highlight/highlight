import { message } from 'antd';
import _ from 'lodash';
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import GoToButton from '../../../../../components/Button/GoToButton';
import Input from '../../../../../components/Input/Input';
import TextHighlighter from '../../../../../components/TextHighlighter/TextHighlighter';
import Tooltip from '../../../../../components/Tooltip/Tooltip';
import { DemoContext } from '../../../../../DemoContext';
import { useGetResourcesQuery } from '../../../../../graph/generated/hooks';
import { formatNumber } from '../../../../../util/numbers';
import { MillisToMinutesAndSeconds } from '../../../../../util/time';
import ReplayerContext, { ReplayerState } from '../../../ReplayerContext';
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
    const { state } = useContext(ReplayerContext);
    const { session_id } = useParams<{ session_id: string }>();
    const { demo } = useContext(DemoContext);
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
        Array<PerformanceResourceTiming & { id: number }> | undefined
    >([]);
    const [parsedResources, setParsedResources] = useState<
        Array<PerformanceResourceTiming & { id: number }> | undefined
    >(undefined);
    const { data, loading } = useGetResourcesQuery({
        variables: {
            session_id: demo
                ? process.env.REACT_APP_DEMO_SESSION ?? ''
                : session_id,
        },
        context: { headers: { 'Highlight-Demo': demo } },
        fetchPolicy: 'no-cache',
    });
    const virtuoso = useRef<VirtuosoHandle>(null);
    const rawResources = data?.resources;

    useEffect(() => {
        const optionSet = new Set<string>();
        rawResources?.forEach((r) => {
            if (!optionSet.has(r.initiatorType)) {
                optionSet.add(r.initiatorType);
            }
        });
        setOptions(['All', ...Array.from(optionSet)]);
        setParsedResources(
            rawResources?.map((r, i) => {
                return { ...r, id: i };
            }) ?? []
        );
    }, [rawResources]);

    useEffect(() => {
        if (rawResources) {
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
    }, [parsedResources, rawResources, currentOption, options]);

    useEffect(() => {
        if (rawResources) {
            const start = rawResources[0].startTime;
            const end = rawResources[rawResources.length - 1].responseEnd;
            setNetworkRange(end - start);
        }
    }, [rawResources]);

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
        _.debounce((index: number, state) => {
            if (virtuoso.current && state === ReplayerState.Playing) {
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
        if (!isInteractingWithResources) {
            scrollFunction(currentResource, state);
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
                <div className={devStyles.optionsWrapper}>
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
                        <TimingCanvas networkRange={networkRange} />
                        <div className={styles.networkTopBar}>
                            <div className={styles.networkColumn}>Type</div>
                            <div className={styles.networkColumn}>Name</div>
                            <div className={styles.networkColumn}>
                                Response Time
                            </div>
                            <div className={styles.networkColumn}>Size</div>
                            <div className={styles.networkColumn}>
                                <div className={styles.networkTimestampGrid}>
                                    <div>
                                        {Math.floor((0 / 5) * networkRange)}ms{' '}
                                    </div>
                                    <div>
                                        {formatNumber(
                                            Math.floor((2 / 5) * networkRange)
                                        )}
                                        ms{' '}
                                    </div>
                                    <div>
                                        {formatNumber(
                                            Math.floor((4 / 5) * networkRange)
                                        )}
                                        ms{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            id="networkStreamWrapper"
                            className={styles.networkStreamWrapper}
                        >
                            {resourcesToRender.length === 0 ? (
                                <p className={styles.noResultsMessage}>
                                    No network resources matching '
                                    {filterSearchTerm}'
                                </p>
                            ) : (
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
                                    itemContent={(index, resource) => (
                                        <ResourceRow
                                            key={index.toString()}
                                            p={resource}
                                            networkRange={networkRange}
                                            currentResource={currentResource}
                                            searchTerm={filterSearchTerm}
                                        />
                                    )}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const TimingCanvas = ({ networkRange }: { networkRange: number }) => {
    const safeUpdateCanvas = useCallback(
        (position: number) => {
            const canvas = canvasRef.current;

            if (!canvas) return;
            canvas.height = canvas.clientHeight * 2;
            canvas.width = canvas.clientWidth * 2;

            const context = canvas?.getContext('2d');

            if (!context) return;
            context.clearRect(0, 0, canvas.width, canvas.height);

            // The actual div width, and the width of the canvas are different. This balances it.
            const realX = (position / canvas.offsetWidth) * canvas.width;

            if (context) {
                context.fillStyle = 'red';
                context.fillRect(realX, 0, 2, canvas.height);

                context.font = '24px Steradian';
                context.fillStyle = 'var(--color-gray-500)';

                const msValue = Math.max(
                    0,
                    Math.floor((realX / canvas.width) * networkRange)
                );
                context.fillText(msValue.toString() + 'ms', realX + 8, 90, 200);
            }
        },
        [networkRange]
    );
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawMouseHover = (
        event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let x =
            event.clientX -
            64 +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;

        x -= canvas.offsetLeft;

        safeUpdateCanvas(x);
    };

    useEffect(() => {
        safeUpdateCanvas(0);
    }, [safeUpdateCanvas]);

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvasNetworkWrapper}
            onMouseMove={(e) => drawMouseHover(e)}
        ></canvas>
    );
};

const ResourceRow = ({
    p,
    networkRange,
    currentResource,
    searchTerm,
}: {
    p: PerformanceResourceTiming & { id: number };
    networkRange: number;
    currentResource: number;
    searchTerm: string;
}) => {
    const { pause } = useContext(ReplayerContext);
    const leftPaddingPercent = (p.startTime / networkRange) * 100;
    const actualPercent = Math.max(
        ((p.responseEnd - p.startTime) / networkRange) * 100,
        0.1
    );
    const rightPaddingPercent = 100 - actualPercent - leftPaddingPercent;
    return (
        <div key={p.id.toString()}>
            <div
                style={{
                    color:
                        p.id === currentResource
                            ? 'var(--text-primary)'
                            : 'var(--color-gray-500)',
                    fontWeight: p.id === currentResource ? 400 : 300,
                }}
                className={styles.networkRow}
            >
                <div className={styles.typeSection}>
                    {getNetworkResourcesDisplayName(p.initiatorType)}
                </div>
                <Tooltip title={p.name}>
                    <div className={styles.nameSection}>
                        <TextHighlighter
                            searchWords={[searchTerm]}
                            autoEscape={true}
                            textToHighlight={p.name}
                        />
                    </div>
                </Tooltip>
                <div>{(p.responseEnd - p.startTime).toFixed(2)} ms</div>
                <div>
                    {p.transferSize === 0 ? (
                        'Cached'
                    ) : (
                        <>{formatSize(p.transferSize)}</>
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
                    onClick={() => {
                        pause(p.startTime);

                        message.success(
                            `Changed player time to when ${getNetworkResourcesDisplayName(
                                p.initiatorType
                            )} request started at ${MillisToMinutesAndSeconds(
                                p.startTime
                            )}.`
                        );
                    }}
                />
            </div>
        </div>
    );
};
const formatSize = (bytes: number) => {
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
