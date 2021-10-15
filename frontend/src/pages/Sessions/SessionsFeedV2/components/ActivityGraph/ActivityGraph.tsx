import React from 'react';
import {
    Area,
    ComposedChart,
    Line,
    ResponsiveContainer,
    YAxis,
} from 'recharts';

interface Props {
    data: any[];
}

const ActivityGraph = ({ data }: Props) => {
    const gridColor = 'none';
    const labelColor = 'var(--color-gray-500)';

    const gradientId = `${name}-colorUv`;
    const lineColor = 'var(--color-purple)';

    return (
        <ResponsiveContainer width="100%" height={40}>
            <ComposedChart
                data={data}
                height={200}
                margin={{
                    top: 12,
                    right: 0,
                    left: 0,
                    bottom: 0,
                }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={lineColor}
                            stopOpacity={0.2}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-primary-background)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <YAxis
                    interval="preserveStart"
                    dataKey="value"
                    width={0}
                    tick={false}
                    tickLine={{ stroke: labelColor, visibility: 'hidden' }}
                    axisLine={{ stroke: gridColor }}
                    domain={[0, 'dataMax']}
                />
                <Line
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    type="monotone"
                    dot={false}
                    activeDot={{
                        fill: lineColor,
                        fillOpacity: 1,
                    }}
                ></Line>
                <Area
                    type="monotone"
                    dataKey="value"
                    strokeWidth={0}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    activeDot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default ActivityGraph;
