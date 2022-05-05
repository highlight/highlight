import Popover from '@components/Popover/Popover';
import React, { useState } from 'react';
import {
    Bar,
    BarChart,
    ReferenceArea,
    ResponsiveContainer,
    Tooltip,
    XAxis,
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
    bucketStartTimes: number[];
    onAreaChanged: (left: number, right: number) => void;
    seriesList: Series[];
    timeFormatter: (value: number) => string;
    tooltipContent: (bucketIndex: number | undefined) => React.ReactNode;
}

const Histogram = ({
    startTime,
    onAreaChanged,
    seriesList,
    bucketStartTimes,
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

    // assert all series have the same length
    const seriesLength = bucketStartTimes.length;
    if (!seriesList.every((s) => s.counts.length === seriesLength)) {
        throw new Error('all series must have the same length');
    }

    const chartData: {
        [key: string]: string | number;
    }[] = [];
    for (let i = 0; i < bucketStartTimes.length; i++) {
        chartData.push({});
    }

    for (const s of seriesList) {
        for (let i = 0; i < seriesLength; i++) {
            chartData[i][s.label] = s.counts[i];
        }
    }

    console.log('chartData', chartData);

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
                                console.log('onMouseDown', e);
                                setDragStart(e.activeLabel);
                                setDragEnd(e.activeLabel);
                            }}
                            onMouseMove={(e: any) => {
                                if (!e) {
                                    return;
                                }
                                if (dragStart !== undefined) {
                                    console.log('onMouseMove', e);
                                    setDragEnd(e.activeLabel);
                                }
                            }}
                            onMouseUp={() => {
                                console.log('onMouseUp');
                                if (
                                    dragLeft !== undefined &&
                                    dragRight !== undefined
                                ) {
                                    onAreaChanged(dragLeft, dragRight);
                                    console.log(
                                        'onMouseUp area changed',
                                        dragLeft,
                                        dragRight
                                    );
                                }
                                setDragStart(undefined);
                                setDragEnd(undefined);
                            }}
                            onMouseLeave={() => {
                                console.log('onMouseLeave');
                                setDragStart(undefined);
                                setDragEnd(undefined);
                            }}
                        >
                            <XAxis
                                style={{
                                    userSelect: 'none',
                                }}
                                tickFormatter={(value, index) => {
                                    const t = bucketStartTimes[index];
                                    return timeFormatter(t);
                                }}
                                height={15}
                            />
                            <Tooltip
                                content={(val) => {
                                    return (
                                        <Popover placement="top">
                                            <div
                                                className={
                                                    styles.tooltipPopover
                                                }
                                            >
                                                {tooltipContent(val.label)}
                                            </div>
                                        </Popover>
                                    );
                                }}
                                wrapperStyle={{
                                    zIndex: 9999999999,
                                    top: -200,
                                    height: 300,
                                    left: 10,
                                    overflow: 'auto',
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
