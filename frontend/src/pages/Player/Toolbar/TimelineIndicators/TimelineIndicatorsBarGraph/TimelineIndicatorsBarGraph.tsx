import Button from '@components/Button/Button/Button';
import Histogram, { Series } from '@components/Histogram/Histogram';
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
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { useParams } from '@util/react-router/useParams';
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils';
import { MillisToMinutesAndSeconds } from '@util/time';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import timelineAnnotationStyles from '../../TimelineAnnotation/TimelineAnnotation.module.scss';
import { getAnnotationColor, TimelineAnnotationColors } from '../../Toolbar';
import styles from './TimelineIndicatorsBarGraph.module.scss';

interface Props {
    sessionIntervals: ParsedSessionInterval[];
    selectedTimelineAnnotationTypes: string[];
}

interface SeriesState {
    bucketTimes: number[];
    chartData: any[];
    eventsSeries: Series[];
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
            time,
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

        const [seriesState, setSeriesState] = useState<SeriesState>({
            bucketTimes: [],
            chartData: [],
            eventsSeries: [],
        });

        const getTimeFromPercent = useCallback(
            (percent: number): number | undefined => {
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
            },
            [sessionIntervals]
        );

        const numberOfBars = 50;
        const percentPerBar = 1 / numberOfBars;
        const scale = zoomAreaRight - zoomAreaLeft;

        // Filter the events and map to a new relativeIntervalPercentage (since the window size has shrunk)
        const filterAndMap = useCallback(
            <T extends { relativeIntervalPercentage?: number }>(
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
                    })),
            [zoomAreaLeft, zoomAreaRight]
        );

        useEffect(() => {
            if (sessionIntervals.length == 0) {
                return;
            }

            const startTime = sessionIntervals[0].startTime;
            const endTime =
                sessionIntervals[sessionIntervals.length - 1].endTime;

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
                                    (interval.endPercent -
                                        interval.startPercent) *
                                        (e.relativeIntervalPercentage ?? 0),
                            })),
                        ],
                        sessionEvents: [
                            ...acc.sessionEvents,
                            ...interval.sessionEvents.map((e) => ({
                                ...e,
                                relativeIntervalPercentage:
                                    interval.startPercent * 100 +
                                    (interval.endPercent -
                                        interval.startPercent) *
                                        (e.relativeIntervalPercentage ?? 0),
                            })),
                        ],
                        comments: [
                            ...acc.comments,
                            ...interval.comments.map((e) => ({
                                ...e,
                                relativeIntervalPercentage:
                                    interval.startPercent * 100 +
                                    (interval.endPercent -
                                        interval.startPercent) *
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

            combined.errors = filterAndMap(combined.errors);
            combined.sessionEvents = filterAndMap(combined.sessionEvents);
            combined.comments = filterAndMap(combined.comments);

            const tempChartData = getEventsInTimeBucket(
                combined,
                selectedTimelineAnnotationTypes,
                percentPerBar
            );

            const tempBucketTimes: number[] = [];
            for (let i = 0; i <= numberOfBars; i++) {
                const p = i * percentPerBar * scale + zoomAreaLeft;
                tempBucketTimes.push(getTimeFromPercent(p) ?? 0);
            }

            const tempEventsSeries = EventsForTimeline.map((eventType) => ({
                label: eventType,
                color: getAnnotationColor(eventType),
                counts: new Array<number>(),
            }));

            for (const d of tempChartData) {
                for (const s of tempEventsSeries) {
                    s.counts.push(d[s.label] || 0);
                }
            }

            setSeriesState({
                bucketTimes: tempBucketTimes,
                chartData: tempChartData,
                eventsSeries: tempEventsSeries,
            });
        }, [
            filterAndMap,
            getTimeFromPercent,
            percentPerBar,
            scale,
            selectedTimelineAnnotationTypes,
            sessionIntervals,
            zoomAreaLeft,
        ]);

        const timeFormatter = useCallback(
            (t: number) =>
                showPlayerAbsoluteTime
                    ? playerTimeToSessionAbsoluteTime({
                          sessionStartTime: sessionMetadata.startTime,
                          relativeTime: t,
                      }).toString()
                    : MillisToMinutesAndSeconds(t),
            [sessionMetadata.startTime, showPlayerAbsoluteTime]
        );

        const onBucketClicked = useCallback(
            (bucketIndex) => {
                setTime(seriesState.bucketTimes[bucketIndex]);
            },
            [seriesState.bucketTimes, setTime]
        );

        const onAreaChanged = useCallback(
            (left, right) => {
                setZoomAreaLeft(
                    (zoomAreaRight - zoomAreaLeft) * left * percentPerBar +
                        (zoomAreaLeft ?? 0)
                );
                setZoomAreaRight(
                    (zoomAreaRight - zoomAreaLeft) *
                        (right * percentPerBar + percentPerBar) +
                        zoomAreaLeft
                );
            },
            [
                percentPerBar,
                setZoomAreaLeft,
                setZoomAreaRight,
                zoomAreaLeft,
                zoomAreaRight,
            ]
        );

        const displayAggregate = useCallback(
            (
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
                                className={
                                    timelineAnnotationStyles.iconContainer
                                }
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
            },
            [setCurrentEvent]
        );

        const tooltipContent = useCallback(
            (bucketIndex: number | undefined) => {
                if (bucketIndex === undefined) {
                    return;
                }
                const bucket = seriesState.chartData[bucketIndex];
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
            },
            [seriesState.chartData, displayAggregate]
        );

        const gotoAction = useCallback(
            (bucketIndex) => {
                setTime(seriesState.bucketTimes[bucketIndex]);
            },
            [seriesState.bucketTimes, setTime]
        );

        const getSliderPercent = useCallback(
            (time: number) => {
                let sliderPercent = 0;
                const numIntervals = sessionIntervals.length;
                if (numIntervals > 0) {
                    if (time < sessionIntervals[0].startTime) {
                        return 0;
                    }
                    if (time > sessionIntervals[numIntervals - 1].endTime) {
                        return 1;
                    }
                }
                for (const interval of sessionIntervals) {
                    if (time < interval.endTime && time >= interval.startTime) {
                        const segmentPercent =
                            (time - interval.startTime) /
                            (interval.endTime - interval.startTime);
                        sliderPercent =
                            segmentPercent *
                                (interval.endPercent - interval.startPercent) +
                            interval.startPercent;
                        return sliderPercent;
                    }
                }
                return sliderPercent;
            },
            [sessionIntervals]
        );

        const timelineRef = useRef<HTMLDivElement>(null);
        if (sessionIntervals.length === 0) {
            return (
                <>
                    <div className={styles.scrubberSkeleton}>
                        <Skeleton height={40} />
                    </div>
                    <div className={styles.histogramSkeleton}>
                        <Skeleton height={72} />
                    </div>
                </>
            );
        }

        const sliderPercent = getSliderPercent(time);
        const relativePercent =
            (100 * (sliderPercent * 100 - zoomAreaLeft)) /
            (zoomAreaRight - zoomAreaLeft);

        return (
            <>
                <Scrubber
                    chartData={seriesState.chartData}
                    getSliderPercent={getSliderPercent}
                />
                <div className={styles.histogramContainer}>
                    <div
                        className={styles.innerBounds}
                        style={{
                            width: timelineRef.current
                                ? `${timelineRef.current.clientWidth}px`
                                : '100%',
                        }}
                    >
                        {relativePercent >= 0 && relativePercent <= 100 && (
                            <div
                                className={styles.timeMarker}
                                style={{
                                    left: `${relativePercent}%`,
                                }}
                            ></div>
                        )}
                    </div>
                    <Histogram
                        onAreaChanged={onAreaChanged}
                        onBucketClicked={onBucketClicked}
                        seriesList={seriesState.eventsSeries}
                        timeFormatter={timeFormatter}
                        bucketTimes={seriesState.bucketTimes}
                        tooltipContent={tooltipContent}
                        gotoAction={gotoAction}
                        timelineRef={timelineRef}
                    />
                </div>
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
