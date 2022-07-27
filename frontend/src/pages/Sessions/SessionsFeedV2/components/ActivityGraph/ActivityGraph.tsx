import React from 'react';
import { Area, ComposedChart, ResponsiveContainer } from 'recharts';

interface Props {
    data: any[];
    height?: number;
    disableAnimation?: boolean;
}

const ActivityGraph = ({
    data,
    height = 20,
    disableAnimation = false,
}: Props) => {
    const gradientId = `session-activity-graph-colorUv`;
    const lineColor = 'var(--color-purple)';

    return (
        <ResponsiveContainer width="99.9%" height={height}>
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
                    opacity: 0.3,
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
                            stopOpacity={0.2}
                        />
                    </linearGradient>
                </defs>
                <Area
                    isAnimationActive={!disableAnimation}
                    type="natural"
                    dataKey="value"
                    strokeWidth={2}
                    fillOpacity={1}
                    stroke={lineColor}
                    fill={`url(#${gradientId})`}
                    activeDot={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default ActivityGraph;
