import React, { useState } from 'react';
import {
    Bar,
    BarChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import styles from './Histogram.module.scss';

interface Series {
    label: string;
    color: string; // Color as a css var e.g. --color-green-300
    counts: number[];
}

interface Props {
    startTime: number;
    endTime: number;
    bucketTimes: number[];
    onAreaChanged: (left: number, right: number) => void;
    onBucketClicked: (bucketIndex: number) => void;
    seriesList: Series[];
    timeFormatter: (value: number) => string;
    tooltipContent: (bucketIndex: number | undefined) => React.ReactNode;
}

const Histogram = ({
    startTime,
    onAreaChanged,
    onBucketClicked,
    seriesList,
    bucketTimes,
    timeFormatter,
    tooltipContent,
}: Props) => {
    const [dragStart, setDragStart] = useState<number | undefined>();
    const [dragEnd, setDragEnd] = useState<number | undefined>();
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

    const getTooltipContent = (val: any) => {
        if (dragLeft !== undefined && dragRight !== undefined) {
            const leftTime = timeFormatter(bucketStartTimes[dragLeft]);
            const rightTime = timeFormatter(bucketEndTimes[dragRight]);
            return (
                <div className={styles.tooltipPopover}>
                    <div className={styles.popoverContent}>
                        <div className={styles.title}>
                            {leftTime}
                            {dragLeft !== dragRight && ` to ${rightTime}`}
                        </div>
                    </div>
                </div>
            );
        } else {
            const leftTime = timeFormatter(bucketStartTimes[val.label]);
            const rightTime = timeFormatter(bucketEndTimes[val.label]);
            return (
                <div className={styles.tooltipPopover}>
                    <div className={styles.popoverContent}>
                        <div className={styles.title}>
                            {`${leftTime} to ${rightTime}`}
                        </div>
                        {tooltipContent(val.label)}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.graphContainer}>
                <div key={startTime} className={styles.sessionInterval}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            barGap={0}
                            margin={{
                                top: 0,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
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
                            }}
                        >
                            <Tooltip
                                content={getTooltipContent}
                                wrapperStyle={{
                                    bottom: '100%',
                                    top: 'none',
                                    position: 'absolute',
                                    zIndex: 100,
                                    overflow: 'auto',
                                }}
                                allowEscapeViewBox={{
                                    x: false,
                                    y: false,
                                }}
                            />
                            {seriesList.map((s) => (
                                <Bar
                                    key={s.label}
                                    dataKey={s.label}
                                    stackId="a"
                                    fill={`var(${s.color})`}
                                />
                            ))}
                            {dragStart !== undefined &&
                            dragEnd !== undefined ? (
                                <ReferenceArea
                                    x1={dragLeft}
                                    x2={dragRight}
                                    strokeOpacity={0.3}
                                />
                            ) : null}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Histogram;
