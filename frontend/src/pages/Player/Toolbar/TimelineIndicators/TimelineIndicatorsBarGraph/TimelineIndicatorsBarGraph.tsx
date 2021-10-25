import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { ParsedSessionInterval } from '@pages/Player/ReplayerContext';
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts';

import styles from './TimelineIndicatorsBarGraph.module.scss';

interface Props {
    sessionIntervals: ParsedSessionInterval[];
}

const TimelineIndicatorsBarGraph = React.memo(({ sessionIntervals }: Props) => {
    const activeSessionIntervals = sessionIntervals.filter(
        (interval) => interval.active
    );

    const data = [
        {
            name: 'Page A',
            uv: 4000,
            pv: 2400,
        },
        {
            name: 'Page B',
            uv: 3000,
            pv: 1398,
        },
        {
            name: 'Page C',
            uv: 2000,
            pv: 9800,
        },
        {
            name: 'Page D',
            uv: 2780,
            pv: 3908,
        },
        {
            name: 'Page E',
            uv: 1890,
            pv: 4800,
        },
        {
            name: 'Page F',
            uv: 2390,
            pv: 3800,
        },
        {
            name: 'Page G',
            uv: 3490,
            pv: 4300,
        },
    ];

    console.log(getEventsInTimeBucket(sessionIntervals));

    return (
        <div className={styles.container}>
            {activeSessionIntervals.map((interval) => (
                <div
                    key={interval.startTime}
                    style={{
                        left: `${interval.startPercent * 100}%`,
                        width: `calc((${interval.endPercent * 100}%) - (${
                            interval.startPercent * 100
                        }%))`,
                    }}
                    className={styles.sessionInterval}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            barSize={32}
                            barGap={0}
                            margin={{
                                top: 0,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <Tooltip content={<RechartTooltip />} />
                            <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                            <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </div>
    );
});

export default TimelineIndicatorsBarGraph;

/**
 * Units is milliseconds.
 * This represents the time span for each bucket.
 */
const BUCKET_SIZE = 1000;

const getEventsInTimeBucket = (intervals: ParsedSessionInterval[]) => {
    intervals.forEach((interval) => {
        const { startTime, endTime } = interval;

        console.log(interval);
    });
};
