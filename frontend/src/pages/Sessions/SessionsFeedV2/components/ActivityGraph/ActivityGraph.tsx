import React from 'react';
import { Area, ComposedChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
    data: any[];
}

const ActivityGraph = ({ data }: Props) => {
    const gradientId = `session-activity-graph-colorUv`;
    const lineColor = 'var(--color-purple)';

    return (
        <ResponsiveContainer width="100%" height={20}>
            <ComposedChart
                data={data}
                height={200}
                margin={{
                    top: 4,
                    right: 0,
                    left: 0,
                    bottom: 2,
                }}
                style={{
                    opacity: 0.5,
                }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={lineColor}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-primary-background)"
                            stopOpacity={1}
                        />
                    </linearGradient>
                </defs>
                <Line
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={2}
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
