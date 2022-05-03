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
}

const Histogram = ({
    startTime,
    onAreaChanged,
    seriesList,
    bucketStartTimes,
    timeFormatter,
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
    for (const t of bucketStartTimes) {
        chartData.push({ label: timeFormatter(t) });
    }

    for (const s of seriesList) {
        for (let i = 0; i < seriesLength; i++) {
            chartData[i][s.label] = s.counts[i];
        }
    }

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
                                    onAreaChanged(dragLeft, dragRight);
                                }
                                setDragStart(undefined);
                                setDragEnd(undefined);
                            }}
                            onMouseLeave={() => {
                                setDragStart(undefined);
                                setDragEnd(undefined);
                            }}
                        >
                            <XAxis dataKey="label" />
                            <Tooltip
                                content={
                                    // ZANETODO
                                    <div>tooltip :)</div>
                                }
                                wrapperStyle={{ zIndex: 99999 }}
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
