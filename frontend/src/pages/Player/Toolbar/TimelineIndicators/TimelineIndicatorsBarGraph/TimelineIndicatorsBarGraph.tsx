import Button from '@components/Button/Button/Button';
import Histogram from '@components/Histogram/Histogram';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import {
    ParsedErrorObject,
    ParsedHighlightEvent,
    ParsedSessionComment,
    ParsedSessionInterval,
    useReplayerContext,
} from '@pages/Player/ReplayerContext';
import { getPlayerEventIcon } from '@pages/Player/StreamElement/StreamElement';
import Scrubber from '@pages/Player/Toolbar/Scrubber/Scrubber';
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { getAnnotationColor } from '@pages/Player/Toolbar/Toolbar';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { useParams } from '@util/react-router/useParams';
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils';
import { MillisToMinutesAndSeconds } from '@util/time';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import timelineAnnotationStyles from '../../TimelineAnnotation/TimelineAnnotation.module.scss';
import { TimelineAnnotationColors } from '../../Toolbar';
import styles from './TimelineIndicatorsBarGraph.module.scss';

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
        const { showPlayerAbsoluteTime } = usePlayerConfiguration();
        const {
            sessionMetadata,
            setTime,
            setCurrentEvent,
        } = useReplayerContext();
        const { session_secure_id } = useParams<{
            session_secure_id: string;
        }>();

        useEffect(() => {
            setZoomAreaLeft(0);
            setZoomAreaRight(100);
        }, [session_secure_id, setZoomAreaLeft, setZoomAreaRight]);

        if (sessionIntervals.length === 0) {
            return <Skeleton />;
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

        // Filter the events and map to a new relativeIntervalPercentage (since the window size has shrunk)
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

        const scale = zoomAreaRight - zoomAreaLeft;
        const bucketTimes: number[] = [];
        for (let i = 0; i <= numberOfBars; i++) {
            const p = i * percentPerBar * scale + zoomAreaLeft;
            bucketTimes.push(getTimeFromPercent(p) ?? 0);
        }

        const displayAggregate = (
            count: number,
            eventType: string,
            firstEvent:
                | ParsedErrorObject
                | ParsedHighlightEvent
                | ParsedSessionComment
        ) => {
            const Icon = getPlayerEventIcon(eventType);
            return (
                <>
                    <Button
                        className={classNames(
                            timelineAnnotationStyles.title,
                            styles.eventTitle
                        )}
                        type="text"
                        trackingId="ViewEventDetail"
                        onClick={() => {
                            if ('identifier' in firstEvent) {
                                setCurrentEvent(firstEvent.identifier);
                            }
                        }}
                    >
                        <span
                            className={timelineAnnotationStyles.iconContainer}
                            style={{
                                background: `var(${
                                    // @ts-ignore
                                    TimelineAnnotationColors[eventType]
                                })`,
                                width: '30px',
                                height: '30px',
                            }}
                        >
                            {Icon}
                        </span>
                        {getTimelineEventDisplayName(eventType || '')}
                        {count > 1 && ` x ${count}`}
                    </Button>
                </>
            );
        };

        const tooltipContent = (bucketIndex: number | undefined) => {
            if (bucketIndex === undefined) {
                return;
            }
            const bucket = chartData[bucketIndex];
            const labels = [];
            for (const e of EventsForTimeline) {
                const count = bucket[e];
                if (count > 0) {
                    const firstEvent = bucket.firstEvent[e];
                    labels.push(displayAggregate(count, e, firstEvent));
                }
            }
            if (labels.length === 0) {
                return null;
            } else {
                return <>{labels}</>;
            }
        };

        const timeFormatter = (t: number) =>
            showPlayerAbsoluteTime
                ? playerTimeToSessionAbsoluteTime({
                      sessionStartTime: sessionMetadata.startTime,
                      relativeTime: t,
                  }).toString()
                : MillisToMinutesAndSeconds(t);

        return (
            <>
                <div className={styles.histogramContainer}>
                    <Histogram
                        startTime={combined.startTime}
                        endTime={combined.endTime}
                        onAreaChanged={(left, right) => {
                            setZoomAreaLeft(
                                (zoomAreaRight - zoomAreaLeft) *
                                    left *
                                    percentPerBar +
                                    (zoomAreaLeft ?? 0)
                            );
                            setZoomAreaRight(
                                (zoomAreaRight - zoomAreaLeft) *
                                    (right * percentPerBar + percentPerBar) +
                                    zoomAreaLeft
                            );
                        }}
                        onBucketClicked={(bucketIndex) => {
                            setTime(bucketTimes[bucketIndex]);
                        }}
                        seriesList={series}
                        timeFormatter={timeFormatter}
                        bucketTimes={bucketTimes}
                        tooltipContent={tooltipContent}
                        gotoAction={(bucketIndex) => {
                            setTime(bucketTimes[bucketIndex]);
                        }}
                    />
                </div>
                <Scrubber />
            </>
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
        data[i.toString()] = { firstEvent: {}, count: 0 };
    }

    interval.sessionEvents.forEach((event) => {
        if (event.type === 5 && event.relativeIntervalPercentage) {
            const eventType = event.data.tag;

            if (!selectedTimelineAnnotationTypes.includes(eventType)) {
                return;
            }

            const bucketKey = getBucketKey(event, numberOfBuckets);
            data[bucketKey].count++;

            if (!(eventType in data[bucketKey])) {
                data[bucketKey][eventType] = 1;
                data[bucketKey].firstEvent[eventType] = event;
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
            data[bucketKey].count++;

            if (!('Errors' in data[bucketKey])) {
                data[bucketKey]['Errors'] = 1;
                data[bucketKey].firstEvent['Errors'] = error;
            } else {
                data[bucketKey]['Errors']++;
            }
        });
    }

    if (selectedTimelineAnnotationTypes.includes('Comments')) {
        interval.comments.forEach((comment) => {
            if (comment.relativeIntervalPercentage === undefined) {
                return;
            }

            const bucketKey = getBucketKey(comment, numberOfBuckets);
            data[bucketKey].count++;

            if (!('Comments' in data[bucketKey])) {
                data[bucketKey]['Comments'] = 1;
                data[bucketKey].firstEvent['Comments'] = comment;
            } else {
                data[bucketKey]['Comments']++;
            }
        });
    }

    const res = Object.keys(data).map((key) => ({
        ...data[key],
    }));

    return res;
};
