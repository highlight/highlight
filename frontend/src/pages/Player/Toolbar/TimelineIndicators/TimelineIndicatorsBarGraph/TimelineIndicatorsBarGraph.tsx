import Histogram from '@components/Histogram/Histogram';
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import {
    ParsedHighlightEvent,
    ParsedSessionInterval,
} from '@pages/Player/ReplayerContext';
import {
    getEventRenderDetails,
    getPlayerEventIcon,
} from '@pages/Player/StreamElement/StreamElement';
import StreamElementPayload from '@pages/Player/StreamElement/StreamElementPayload';
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import React from 'react';

import timelineAnnotationStyles from '../../TimelineAnnotation/TimelineAnnotation.module.scss';
import { TimelineAnnotationColors } from '../../Toolbar';
import styles from '../../Toolbar.module.scss';

interface Props {
    sessionIntervals: ParsedSessionInterval[];
    selectedTimelineAnnotationTypes: string[];
}

const TimelineIndicatorsBarGraph = React.memo(
    ({ sessionIntervals, selectedTimelineAnnotationTypes }: Props) => {
        const {
            zoomAreaLeft,
            setZoomAreaLeft,
            zoomAreaRight,
            setZoomAreaRight,
        } = useToolbarItemsContext();

        if (sessionIntervals.length === 0) {
            return null;
        }

        const numberOfBars = 50;
        const percentPerBar = 1 / numberOfBars;

        const startTime = sessionIntervals[0].startTime;
        const endTime = sessionIntervals[sessionIntervals.length - 1].endTime;

        const combined = sessionIntervals.reduce(
            (acc, interval) => {
                return {
                    ...acc,
                    errors: [
                        ...acc.errors,
                        ...interval.errors.map((e) => ({
                            ...e,
                            relativeIntervalPercentage:
                                interval.startPercent * 100 +
                                (interval.endPercent - interval.startPercent) *
                                    (e.relativeIntervalPercentage ?? 0),
                        })),
                    ],
                    sessionEvents: [
                        ...acc.sessionEvents,
                        ...interval.sessionEvents.map((e) => ({
                            ...e,
                            relativeIntervalPercentage:
                                interval.startPercent * 100 +
                                (interval.endPercent - interval.startPercent) *
                                    (e.relativeIntervalPercentage ?? 0),
                        })),
                    ],
                    comments: [
                        ...acc.comments,
                        ...interval.comments.map((e) => ({
                            ...e,
                            relativeIntervalPercentage:
                                interval.startPercent * 100 +
                                (interval.endPercent - interval.startPercent) *
                                    (e.relativeIntervalPercentage ?? 0),
                        })),
                    ],
                };
            },
            {
                startTime,
                endTime,
                duration: endTime - startTime,
                active: true,
                startPercent: 0,
                endPercent: 1,
                errors: [],
                sessionEvents: [],
                comments: [],
            }
        );

        // If a left and right zoom areas are defined, filter the events
        // and map to a new relativeIntervalPercentage (since the window size has shrunk)
        if (zoomAreaLeft !== undefined && zoomAreaRight !== undefined) {
            const filterAndMap = <
                T extends { relativeIntervalPercentage?: number }
            >(
                events: T[]
            ): T[] =>
                events
                    .filter(
                        (e) =>
                            e.relativeIntervalPercentage !== undefined &&
                            e.relativeIntervalPercentage >= zoomAreaLeft &&
                            e.relativeIntervalPercentage <= zoomAreaRight
                    )
                    .map((e) => ({
                        ...e,
                        relativeIntervalPercentage:
                            ((e.relativeIntervalPercentage! - zoomAreaLeft) /
                                (zoomAreaRight - zoomAreaLeft)) *
                            100,
                    }));

            combined.errors = filterAndMap(combined.errors);
            combined.sessionEvents = filterAndMap(combined.sessionEvents);
            combined.comments = filterAndMap(combined.comments);
        }

        const getTimeFromPercent = (percent: number): number | undefined => {
            for (const interval of sessionIntervals) {
                if (
                    interval.startPercent * 100 <= percent &&
                    interval.endPercent * 100 >= percent
                ) {
                    const globalPctInInterval =
                        percent - interval.startPercent * 100;
                    const intervalOffset =
                        globalPctInInterval /
                        (interval.endPercent - interval.startPercent) /
                        100;
                    const timeOffset =
                        (interval.endTime - interval.startTime) *
                        intervalOffset;
                    return interval.startTime + timeOffset;
                }
            }
        };

        // const zoomTimeLeft = getTimeFromPercent(zoomAreaLeft ?? 0);
        // const zoomTimeRight = getTimeFromPercent(zoomAreaRight ?? 0);

        const chartData = getEventsInTimeBucket(
            combined,
            selectedTimelineAnnotationTypes,
            percentPerBar
        );

        const series = EventsForTimeline.map((eventType) => ({
            label: eventType,
            color: getAnnotationColor(eventType),
            counts: new Array<number>(),
        }));

        for (const d of chartData) {
            for (const s of series) {
                s.counts.push(d[s.label] || 0);
            }
        }

        console.log('zoomArea', zoomAreaLeft, zoomAreaRight);
        const scale = (zoomAreaRight ?? 1) - (zoomAreaLeft ?? 0);
        const bucketStartTimes = [];
        for (
            let p = zoomAreaLeft ?? 0;
            p < (zoomAreaRight ?? 1);
            p += percentPerBar * scale
        ) {
            bucketStartTimes.push(getTimeFromPercent(p) ?? 0);
        }

        const tooltipContent = (bucketIndex: number | undefined) => {
            console.log('bucketIndex', bucketIndex);
            if (bucketIndex === undefined) {
                return;
            }
            const events: ParsedHighlightEvent[] =
                chartData[bucketIndex].events;
            return events.map((e) => {
                const details = getEventRenderDetails(e);
                const Icon = getPlayerEventIcon(
                    details.title || '',
                    details.payload
                );
                console.log('details', details);
                return (
                    <>
                        <span className={timelineAnnotationStyles.title}>
                            <span
                                className={
                                    timelineAnnotationStyles.iconContainer
                                }
                                style={{
                                    background: `var(${
                                        // @ts-ignore
                                        TimelineAnnotationColors[details.title]
                                    })`,
                                }}
                            >
                                {Icon}
                            </span>
                            {getTimelineEventDisplayName(details.title || '')}
                        </span>
                        <div
                            key={e.timestamp}
                            className={styles.popoverContent}
                        >
                            <StreamElementPayload
                                payload={
                                    typeof details.payload === 'object'
                                        ? JSON.stringify(details.payload)
                                        : typeof details.payload ===
                                              'boolean' &&
                                          details.title?.includes('Tab')
                                        ? details.payload
                                            ? 'The user switched away from this tab.'
                                            : 'The user is currently active on this tab.'
                                        : details.payload
                                }
                            />
                        </div>
                    </>
                );
            });
        };

        console.log('bucketStartTimes', bucketStartTimes);

        return (
            <Histogram
                startTime={combined.startTime}
                endTime={combined.endTime}
                onAreaChanged={(left, right) => {
                    setZoomAreaLeft(
                        ((zoomAreaRight ?? 100) - (zoomAreaLeft ?? 0)) *
                            left *
                            percentPerBar +
                            (zoomAreaLeft ?? 0)
                    );
                    setZoomAreaRight(
                        ((zoomAreaRight ?? 100) - (zoomAreaLeft ?? 0)) *
                            (right * percentPerBar + percentPerBar) +
                            (zoomAreaLeft ?? 0)
                    );
                }}
                seriesList={series}
                timeFormatter={(t) => `${t.toFixed(2)}s`}
                bucketStartTimes={bucketStartTimes}
                tooltipContent={tooltipContent}
            />
        );
    }
);

export default TimelineIndicatorsBarGraph;

const getBucketKey = (
    event: { relativeIntervalPercentage?: number },
    numberOfBuckets: number
) => {
    let bucketKey = Math.floor(
        ((event.relativeIntervalPercentage ?? 0) * numberOfBuckets) / 100
    );
    if (bucketKey >= numberOfBuckets) {
        bucketKey = numberOfBuckets - 1;
    }
    if (bucketKey < 0) {
        bucketKey = 0;
    }
    return bucketKey;
};

const getEventsInTimeBucket = (
    interval: ParsedSessionInterval,
    selectedTimelineAnnotationTypes: string[],
    percentPerBar: number
) => {
    const numberOfBuckets = Math.round(
        (interval.endPercent - interval.startPercent) / percentPerBar
    );
    const data: { [key: string]: any } = {};

    for (let i = 0; i < numberOfBuckets; i++) {
        data[i.toString()] = { events: [] };
    }

    interval.sessionEvents.forEach((event) => {
        if (event.type === 5 && event.relativeIntervalPercentage) {
            const eventType = event.data.tag;

            if (!selectedTimelineAnnotationTypes.includes(eventType)) {
                return;
            }

            const bucketKey = getBucketKey(event, numberOfBuckets);

            if (!(event.type in data[bucketKey])) {
                data[bucketKey][eventType] = 1;
            } else {
                data[bucketKey][eventType]++;
            }
            data[bucketKey].events.push(event);
        }
    });

    if (selectedTimelineAnnotationTypes.includes('Errors')) {
        interval.errors.forEach((error) => {
            if (error.relativeIntervalPercentage === undefined) {
                return;
            }

            const bucketKey = getBucketKey(error, numberOfBuckets);

            if (!(error.type in data[bucketKey])) {
                data[bucketKey]['Errors'] = 1;
            } else {
                data[bucketKey]['Errors']++;
            }
        });
    }

    const res = Object.keys(data).map((key) => ({
        ...data[key],
    }));

    return res;
};
