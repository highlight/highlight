import { RechartTooltip } from '@components/recharts/RechartTooltip/RechartTooltip';
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import { ParsedSessionInterval } from '@pages/Player/ReplayerContext';
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar';
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
                            data={getEventsInTimeBucket(interval)}
                            barGap={0}
                            margin={{
                                top: 0,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <Tooltip
                                content={<RechartTooltip />}
                                wrapperStyle={{ zIndex: 99999 }}
                            />
                            {EventsForTimeline.map((eventType) => (
                                <Bar
                                    key={eventType}
                                    dataKey={eventType}
                                    stackId="a"
                                    fill={`var(${getAnnotationColor(
                                        eventType
                                    )})`}
                                />
                            ))}
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

const getEventsInTimeBucket = (interval: ParsedSessionInterval) => {
    const { startTime, endTime } = interval;
    const timeSpanInMilliseconds = endTime - startTime;
    const numberOfBuckets = Math.floor(timeSpanInMilliseconds / BUCKET_SIZE);
    const data: { [key: string]: any } = {};

    for (let i = 0; i < numberOfBuckets; i++) {
        data[i.toString()] = {};
    }

    interval.sessionEvents.forEach((event) => {
        if (event.type === 5 && event.relativeIntervalPercentage) {
            const eventType = event.data.tag;

            const eventTimestampInMilliseconds =
                (event.relativeIntervalPercentage / 100) *
                timeSpanInMilliseconds;

            const bucketKey = Math.floor(
                eventTimestampInMilliseconds / BUCKET_SIZE
            );

            if (!(event.type in data[bucketKey])) {
                data[bucketKey][eventType] = 1;
            } else {
                data[bucketKey][eventType]++;
            }
        }
    });

    const res = Object.keys(data).map((key, index) => ({
        ...data[key],
        name: `INdex ${index}`,
    }));

    return res;
};
