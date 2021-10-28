import { ParsedSessionInterval } from '@pages/Player/ReplayerContext';
import React from 'react';
import { Area, ComposedChart, ResponsiveContainer } from 'recharts';

interface Props {
    sessionIntervals: ParsedSessionInterval[];
    totalTime: number;
}

const TimelineActivityGraph = React.memo(
    ({ sessionIntervals, totalTime }: Props) => {
        const gradientId = `session-activity-graph-colorUv`;
        const lineColor = 'var(--color-purple)';
        const data = getActivityGraphData(sessionIntervals, totalTime);

        return (
            <ResponsiveContainer width="100%" height={200}>
                <ComposedChart
                    data={data}
                    height={200}
                    margin={{
                        top: 4,
                        right: 0,
                        left: 0,
                        bottom: 2,
                    }}
                >
                    <defs>
                        <linearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
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
                        type="natural"
                        dataKey="count"
                        strokeWidth={2}
                        fillOpacity={1}
                        stroke={lineColor}
                        fill={`url(#${gradientId})`}
                        activeDot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        );
    }
);

export default TimelineActivityGraph;

/**
 * Milliseconds
 */
const TIME_SPAN = 1000 * 1;

const getActivityGraphData = (
    sessionIntervals: ParsedSessionInterval[],
    totalTime: number
) => {
    const numberOfPoints = Math.floor(totalTime / TIME_SPAN);
    const graphData = Array.from(Array(numberOfPoints)).map((_, i) => ({
        time: i,
        count: 0,
    }));
    const propertiesToGraph = ['errors', 'sessionEvents'] as const;

    sessionIntervals.forEach((interval) => {
        const { startTime, endTime } = interval;
        const timeSpanInMilliseconds = endTime - startTime;

        propertiesToGraph.forEach((property) => {
            interval[property].forEach((event) => {
                if (event.relativeIntervalPercentage === undefined) {
                    return;
                }
                const eventTimestampInMilliseconds =
                    (event.relativeIntervalPercentage / 100) *
                        timeSpanInMilliseconds +
                    startTime;
                const eventTimestampInSeconds =
                    eventTimestampInMilliseconds / 1000;

                const index = Math.floor(eventTimestampInSeconds);
                console.log(index, graphData.length);
                if (index < graphData.length) {
                    graphData[index].count++;
                }
            });
        });
    });

    return graphData;
};
