import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar';
import React, { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Bar, BarChart, Tooltip } from 'recharts';

import styles from './Histogram.module.scss';

const POPOVER_TIMEOUT_MS = 300;
const BAR_RADIUS_PX = 2;

interface Props {
    onBucketClicked: (bucketIndex: number) => void;
    tooltipContent: (bucketIndex: number | undefined) => React.ReactNode;
    timelineRef: React.RefObject<HTMLDivElement>;
    buckets: EventBucket[];
}

export interface EventBucket {
    [props: string]: number | string;
}

const Histogram = React.memo(
    ({ buckets, onBucketClicked, tooltipContent, timelineRef }: Props) => {
        const [activeLabel, setActiveLabel] = useState<number | undefined>();
        const [tooltipHidden, setTooltipHidden] = useState(true);
        const [tooltipWantHidden, setTooltipWantHidden] = useState(true);

        useEffect(() => {
            // Return if we don't want the tooltip to be hidden or it's already hidden
            // Any existing timeout will be cleared
            if (!tooltipWantHidden || tooltipHidden) {
                return;
            }

            const id = setTimeout(
                () => setTooltipHidden(true),
                POPOVER_TIMEOUT_MS
            );

            return () => {
                clearTimeout(id);
            };
        }, [tooltipHidden, tooltipWantHidden]);

        const EventTooltip = ({ label }: any) => {
            return (
                <div
                    className={styles.tooltipPopover}
                    onMouseOver={() => {
                        setTooltipHidden(false);
                        setTooltipWantHidden(false);
                    }}
                    onMouseLeave={() => {
                        setTooltipWantHidden(true);
                    }}
                >
                    <div className={styles.popoverContent}>
                        {tooltipContent(label)}
                    </div>
                </div>
            );
        };

        return (
            <div className={styles.container}>
                <div ref={timelineRef} className={styles.graphContainer}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <BarChart
                                data={buckets}
                                barGap={0}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 0,
                                }}
                                height={height}
                                width={width}
                                onMouseDown={(e: any) => {
                                    if (!e) {
                                        return;
                                    }
                                    setActiveLabel(e.activeLabel);
                                }}
                                onMouseMove={(e: any) => {
                                    if (!e) {
                                        return;
                                    }
                                    setTooltipHidden(false);
                                    setTooltipWantHidden(false);
                                }}
                                onMouseUp={() => {
                                    if (activeLabel !== undefined) {
                                        onBucketClicked(activeLabel);
                                    }
                                    setActiveLabel(undefined);
                                }}
                                onMouseLeave={() => {
                                    setActiveLabel(undefined);
                                    setTooltipWantHidden(true);
                                }}
                                onMouseEnter={() => {
                                    setTooltipHidden(false);
                                    setTooltipWantHidden(false);
                                }}
                            >
                                <Tooltip
                                    content={<EventTooltip />}
                                    wrapperStyle={{
                                        bottom: '100%',
                                        top: 'none',
                                        position: 'absolute',
                                        zIndex: 400,
                                        overflow: 'auto',
                                        visibility: tooltipHidden
                                            ? 'hidden'
                                            : 'visible',
                                        scale: tooltipHidden ? 0 : 1,
                                        pointerEvents: 'inherit',
                                    }}
                                    cursor={{
                                        fill: 'rgba(204, 204, 204, .5)',
                                    }}
                                    allowEscapeViewBox={{
                                        x: false,
                                        y: false,
                                    }}
                                />
                                {EventsForTimeline.map((eventType) => (
                                    <Bar
                                        isAnimationActive={false}
                                        key={eventType}
                                        dataKey={eventType}
                                        stackId="a"
                                        fill={`var(${getAnnotationColor(
                                            eventType
                                        )})`}
                                    >
                                        {/* {chartData.map((entry, i) => {
                                            const isFirst =
                                                firstSeries[i] ===
                                                eventType.label;
                                            const isLast =
                                                lastSeries[i] ===
                                                eventType.label;

                                            return (
                                                <Cell
                                                    key={`cell-${i}`}
                                                    // @ts-ignore
                                                    radius={[
                                                        isLast
                                                            ? BAR_RADIUS_PX
                                                            : 0,
                                                        isLast
                                                            ? BAR_RADIUS_PX
                                                            : 0,
                                                        isFirst
                                                            ? BAR_RADIUS_PX
                                                            : 0,
                                                        isFirst
                                                            ? BAR_RADIUS_PX
                                                            : 0,
                                                    ]}
                                                />
                                            );
                                        })} */}
                                    </Bar>
                                ))}
                            </BarChart>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }
);

export default Histogram;
