import React from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart as RechartsLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import styles from './LineChart.module.scss';

interface Props {
    data: any[];
    height: number;
    xAxisDataKeyName?: string;
    xAxisTickFormatter?: (value: any, index: number) => string;
    yAxisTickFormatter?: (value: any, index: number) => string;
    lineColorMapping: any;
}

const LineChart = ({
    height,
    xAxisDataKeyName = 'date',
    data,
    xAxisTickFormatter,
    yAxisTickFormatter,
    lineColorMapping,
}: Props) => {
    const nonXAxisKeys = Object.keys(data[0]).filter(
        (keyName) => keyName !== xAxisDataKeyName && keyName !== '__typename'
    );
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 0,
                    right: 0,
                    left: -18,
                    bottom: 0,
                }}
            >
                <CartesianGrid
                    strokeDasharray=""
                    vertical={false}
                    stroke="var(--color-gray-200)"
                />
                <XAxis
                    dataKey={xAxisDataKeyName}
                    tickFormatter={xAxisTickFormatter}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: 'var(--color-gray-200)' }}
                    axisLine={{ stroke: gridColor }}
                    dy={6}
                />
                <YAxis
                    tickFormatter={yAxisTickFormatter}
                    tick={{ fontSize: '11px', fill: labelColor }}
                    tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                    axisLine={{ stroke: gridColor }}
                    dx={-6}
                />
                <Tooltip />
                <Legend
                    verticalAlign="bottom"
                    height={18}
                    iconType={'square'}
                    iconSize={8}
                    content={(props) => {
                        const { payload } = props;

                        return (
                            <div className={styles.legendContainer}>
                                {payload?.map((entry, index) => (
                                    <span
                                        key={`item-${index}`}
                                        onClick={() => {
                                            console.log(
                                                `Do something for ${entry.value}`
                                            );
                                        }}
                                        className={styles.legendItem}
                                    >
                                        <div
                                            className={styles.legendIcon}
                                            style={{ background: entry.color }}
                                        ></div>
                                        {entry.value}
                                    </span>
                                ))}
                            </div>
                        );
                    }}
                />
                {nonXAxisKeys.map((key) => (
                    <Line
                        key={key}
                        type="linear"
                        dataKey={key}
                        stroke={lineColorMapping[key]}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

export default LineChart;
