import GoToButton from '@components/Button/GoToButton';
import React, { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Bar, BarChart, Cell, ReferenceArea, Tooltip } from 'recharts';

import styles from './Histogram.module.scss';

export interface Series {
    label: string;
    color: string; // Color as a css var e.g. --color-green-300
    counts: number[];
}

const POPOVER_TIMEOUT_MS = 300;
const BAR_RADIUS_PX = 2;

interface Props {
    bucketTimes: number[];
    onAreaChanged: (left: number, right: number) => void;
    onBucketClicked: (bucketIndex: number) => void;
    seriesList: Series[];
    timeFormatter: (value: number) => string;
    tooltipContent: (bucketIndex: number | undefined) => React.ReactNode;
    gotoAction?: (bucketIndex: number) => void;
    timelineRef: React.RefObject<HTMLDivElement>;
}

const Histogram = React.memo(
    ({
        onAreaChanged,
        onBucketClicked,
        seriesList,
        bucketTimes,
        timeFormatter,
        tooltipContent,
        gotoAction,
        timelineRef,
    }: Props) => {
        const [dragStart, setDragStart] = useState<number | undefined>();
        const [dragEnd, setDragEnd] = useState<number | undefined>();
        const [tooltipHidden, setTooltipHidden] = useState(true);
        const [tooltipWantHidden, setTooltipWantHidden] = useState(true);

        let dragLeft: number | undefined;
        let dragRight: number | undefined;
        if (dragStart !== undefined && dragEnd !== undefined) {
            dragLeft = Math.min(dragStart, dragEnd);
            dragRight = Math.max(dragStart, dragEnd);
        }

        const bucketStartTimes = bucketTimes.slice(0, -1);
        const bucketEndTimes = bucketTimes.slice(1);

        // assert all series have the same length
        const seriesLength = bucketStartTimes.length;
        if (!seriesList.every((s) => s.counts.length === seriesLength)) {
            console.log('seriesList', seriesList, seriesLength);
            throw new Error('all series must have the same length');
        }

        const chartData: {
            [key: string]: string | number;
        }[] = [];
        for (const {} of bucketStartTimes) {
            chartData.push({});
        }

        for (const s of seriesList) {
            for (let i = 0; i < seriesLength; i++) {
                chartData[i][s.label] = s.counts[i];
            }
        }

        const firstSeries: string[] = [];
        const lastSeries: string[] = [];

        const reversedSeriesList = seriesList.slice().reverse();
        for (let i = 0; i < seriesLength; i++) {
            const curData = chartData[i];
            for (const s of seriesList) {
                if (curData[s.label]) {
                    firstSeries[i] = s.label;
                    break;
                }
            }
            for (const s of reversedSeriesList) {
                if (curData[s.label]) {
                    lastSeries[i] = s.label;
                    break;
                }
            }
        }

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
            let inner;
            if (dragLeft !== undefined && dragRight !== undefined) {
                const leftTime = timeFormatter(bucketStartTimes[dragLeft]);
                const rightTime = timeFormatter(bucketEndTimes[dragRight]);
                inner = (
                    <div className={styles.title}>
                        {leftTime} to {rightTime}
                    </div>
                );
            } else {
                const leftTime = timeFormatter(bucketStartTimes[label]);
                const rightTime = timeFormatter(bucketEndTimes[label]);
                inner = (
                    <>
                        <div className={styles.title}>
                            {`${leftTime} to ${rightTime}`}
                            {gotoAction && (
                                <GoToButton onClick={() => gotoAction(label)} />
                            )}
                        </div>
                        <div className={styles.popoverContent}>
                            {tooltipContent(label)}
                        </div>
                    </>
                );
            }
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
                    {inner}
                </div>
            );
        };

        return (
            <div className={styles.container}>
                <div ref={timelineRef} className={styles.graphContainer}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <BarChart
                                data={chartData}
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
                                    setDragStart(e.activeLabel);
                                    setDragEnd(e.activeLabel);
                                }}
                                onMouseMove={(e: any) => {
                                    if (!e) {
                                        return;
                                    }
                                    setTooltipHidden(false);
                                    setTooltipWantHidden(false);
                                    if (dragStart !== undefined) {
                                        setDragEnd(e.activeLabel);
                                    }
                                }}
                                onMouseUp={() => {
                                    if (
                                        dragLeft !== undefined &&
                                        dragRight !== undefined
                                    ) {
                                        if (dragLeft === dragRight) {
                                            onBucketClicked(dragLeft);
                                        } else {
                                            onAreaChanged(dragLeft, dragRight);
                                        }
                                    }
                                    setDragStart(undefined);
                                    setDragEnd(undefined);
                                }}
                                onMouseLeave={() => {
                                    setDragStart(undefined);
                                    setDragEnd(undefined);
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
                                        fill:
                                            dragLeft !== undefined &&
                                            dragRight !== undefined
                                                ? 'transparent'
                                                : 'rgba(204, 204, 204, .5)',
                                    }}
                                    allowEscapeViewBox={{
                                        x: false,
                                        y: false,
                                    }}
                                />
                                {seriesList.map((s) => (
                                    <Bar
                                        isAnimationActive={false}
                                        key={s.label}
                                        dataKey={s.label}
                                        stackId="a"
                                        fill={`var(${s.color})`}
                                    >
                                        {chartData.map((entry, i) => {
                                            const isFirst =
                                                firstSeries[i] === s.label;
                                            const isLast =
                                                lastSeries[i] === s.label;

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
                                        })}
                                    </Bar>
                                ))}
                                {dragStart !== undefined &&
                                dragEnd !== undefined ? (
                                    <ReferenceArea
                                        x1={dragLeft}
                                        x2={dragRight}
                                    />
                                ) : null}
                            </BarChart>
                        )}
                    </AutoSizer>
                </div>
            </div>
        );
    }
);

export default Histogram;
