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
    bucketStartTimes: number[];
    onLeftChanged: (value: number) => void;
    onRightChanged: (value: number) => void;
    series: Series[];
}

const Histogram = ({
    startTime,
    onLeftChanged,
    onRightChanged,
    series,
}: Props) => {
    const [startArea, setStartArea] = useState<number | undefined>();
    const [selectedAreaLeft, setSelectedAreaLeft] = useState<
        number | undefined
    >();
    const [selectedAreaRight, setSelectedAreaRight] = useState<
        number | undefined
    >();

    const chartData: { [key: string]: number }[] = [];
    if (series.length > 0) {
        for (let i = 0; i < series[0].counts.length; i++) {
            chartData.push({});
        }

        for (const s of series) {
            for (let i = 0; i < s.counts.length; i++) {
                chartData[i][s.label] = s.counts[i];
            }
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
                                setStartArea(e.activeLabel);
                                setSelectedAreaLeft(e.activeLabel);
                                setSelectedAreaRight(e.activeLabel);
                            }}
                            onMouseMove={(e: any) => {
                                if (!e) {
                                    return;
                                }
                                if (startArea !== undefined) {
                                    if (e.activeLabel === startArea) {
                                        setSelectedAreaLeft(e.activeLabel);
                                        setSelectedAreaRight(e.activeLabel);
                                    } else if (e.activeLabel > startArea) {
                                        setSelectedAreaLeft(startArea);
                                        setSelectedAreaRight(e.activeLabel);
                                    } else if (e.activeLabel < startArea) {
                                        setSelectedAreaLeft(e.activeLabel);
                                        setSelectedAreaRight(startArea);
                                    }
                                }
                            }}
                            onMouseUp={() => {
                                if (
                                    selectedAreaLeft !== undefined &&
                                    selectedAreaRight !== undefined
                                ) {
                                    onLeftChanged(selectedAreaLeft);
                                    onRightChanged(selectedAreaRight);
                                }
                                setStartArea(undefined);
                                setSelectedAreaLeft(undefined);
                                setSelectedAreaRight(undefined);
                            }}
                            onMouseLeave={() => {
                                setStartArea(undefined);
                                setSelectedAreaLeft(undefined);
                                setSelectedAreaRight(undefined);
                            }}
                        >
                            <Tooltip
                                content={
                                    // ZANETODO
                                    <div>tooltip :)</div>
                                }
                                wrapperStyle={{ zIndex: 99999 }}
                            />
                            {series.map((s) => (
                                <Bar
                                    key={s.label}
                                    dataKey={s.label}
                                    stackId="a"
                                    fill={`var(${s.color})`}
                                />
                            ))}
                            {selectedAreaLeft !== undefined &&
                            selectedAreaRight !== undefined ? (
                                <ReferenceArea
                                    x1={selectedAreaLeft}
                                    x2={selectedAreaRight}
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
