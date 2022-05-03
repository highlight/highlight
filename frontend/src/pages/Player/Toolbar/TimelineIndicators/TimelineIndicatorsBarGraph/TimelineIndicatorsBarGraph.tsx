import Histogram from '@components/Histogram/Histogram';
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import { ParsedSessionInterval } from '@pages/Player/ReplayerContext';
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import React from 'react';

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

        const percentPerBar = 0.02;

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

        // ZANETODO
        // const getTimeFromPercent = (percent: number): number | undefined => {
        //     for (let i = 0; i < sessionIntervals.length; i++) {
        //         const interval = sessionIntervals[i];
        //         if (interval.startPercent * 100 > percent && i > 0) {
        //             const cur = sessionIntervals[i - 1];
        //             const globalPctInInterval =
        //                 percent - cur.startPercent * 100;
        //             const intervalOffset =
        //                 globalPctInInterval /
        //                 (cur.endPercent - cur.startPercent) /
        //                 100;
        //             const timeOffset =
        //                 (cur.endTime - cur.startTime) * intervalOffset;
        //             return cur.startTime + timeOffset;
        //         }
        //     }
        // };

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

        return (
            <Histogram
                startTime={combined.startTime}
                endTime={combined.endTime}
                bucketStartTimes={[]}
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
        data[i.toString()] = {};
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
