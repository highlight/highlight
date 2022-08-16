import Button from '@components/Button/Button/Button';
import Histogram, {
    EventBucket,
    InactivityPeriod,
} from '@components/Histogram/Histogram';
import ScrubHandle from '@components/ScrubHandle/ScrubHandle';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { EventsForTimeline } from '@pages/Player/PlayerHook/utils';
import {
    ParsedEvent,
    ParsedSessionInterval,
    useReplayerContext,
} from '@pages/Player/ReplayerContext';
import { getPlayerEventIcon } from '@pages/Player/StreamElement/StreamElement';
import ProgressBar from '@pages/Player/Toolbar/ProgressBar/ProgressBar';
import { getTimelineEventDisplayName } from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { useToolbarItemsContext } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { ActivityGraphPoint } from '@pages/Sessions/SessionsFeedV2/components/ActivityGraph/ActivityGraph';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import timelineAnnotationStyles from '../../TimelineAnnotation/TimelineAnnotation.module.scss';
import { TimelineAnnotationColors } from '../../Toolbar';
import styles from './TimelineIndicatorsBarGraph.module.scss';

interface Props {
    selectedTimelineAnnotationTypes: string[];
    numberOfBuckets: number;
}

interface SessionEvent {
    eventType: string;
    sessionLoc: number;
    identifier?: string;
}

const TimelineIndicatorsBarGraph = React.memo(
    ({ selectedTimelineAnnotationTypes, numberOfBuckets }: Props) => {
        const {
            zoomAreaLeft,
            setZoomAreaLeft,
            zoomAreaRight,
            setZoomAreaRight,
        } = useToolbarItemsContext();
        const {
            sessionMetadata: { totalTime },
            sessionIntervals,
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

        const [events, setEvents] = useState<SessionEvent[]>([]);
        const [activityData, setActivityData] = useState<ActivityGraphPoint[]>(
            []
        );
        useEffect(() => {
            const parsedEvents = sessionIntervals
                .filter((session) => session.active)
                .reduce(
                    (acc, interval) =>
                        acc.concat(
                            parseSessionInterval(
                                interval,
                                selectedTimelineAnnotationTypes
                            )
                        ),
                    [] as SessionEvent[]
                );
            parsedEvents.sort((a: any, b: any) => -b.sessionLoc + a.sessionLoc);
            setEvents(parsedEvents);

            const eventBuckets = buildEventBuckets(
                parsedEvents,
                0,
                1,
                selectedTimelineAnnotationTypes,
                numberOfBuckets
            );

            const activityData: ActivityGraphPoint[] = eventBuckets.map(
                (bucket) => {
                    return {
                        value: bucket.totalCount as number,
                    };
                }
            );
            setActivityData(activityData);
        }, [
            numberOfBuckets,
            selectedTimelineAnnotationTypes,
            sessionIntervals,
        ]);

        const [buckets, setBuckets] = useState<EventBucket[]>([]);
        const [inactivityData, setInactivityData] = useState<
            InactivityPeriod[]
        >([]);
        useEffect(() => {
            if (!events.length) {
                return;
            }

            const leftProgress = zoomAreaLeft / 100;
            let firstIdx;
            for (firstIdx = 0; firstIdx < events.length; ++firstIdx) {
                if (leftProgress <= events[firstIdx].sessionLoc) {
                    break;
                }
            }

            const rightProgress = zoomAreaRight / 100;
            let lastIdx;
            for (lastIdx = events.length - 1; firstIdx >= 0; --lastIdx) {
                if (rightProgress >= events[lastIdx].sessionLoc) {
                    break;
                }
            }

            const eventBuckets = buildEventBuckets(
                events.slice(firstIdx, lastIdx + 1),
                leftProgress,
                rightProgress,
                selectedTimelineAnnotationTypes,
                numberOfBuckets
            );
            setBuckets(eventBuckets);

            const inactivityPeriods: InactivityPeriod[] = sessionIntervals
                .filter((session) => {
                    const isInactive = !session.active;
                    const endsInside =
                        leftProgress <= session.endPercent &&
                        session.endPercent <= rightProgress;
                    const beginsInside =
                        session.startPercent >= leftProgress &&
                        session.startPercent <= rightProgress;

                    const isFullCover =
                        session.startPercent <= leftProgress &&
                        rightProgress <= session.endPercent;

                    return (
                        isInactive &&
                        (beginsInside || endsInside || isFullCover)
                    );
                })
                .map((session) => {
                    const start = Math.max(session.startPercent, leftProgress);
                    const end = Math.min(session.endPercent, rightProgress);

                    const scale = rightProgress - leftProgress;

                    const relStart = (start - leftProgress) / scale;

                    const relWidth = (end - start) / scale;

                    return {
                        relStart,
                        relWidth,
                    };
                })
                .filter(({ relWidth }) => relWidth > 0);

            setInactivityData(inactivityPeriods);
        }, [
            events,
            numberOfBuckets,
            selectedTimelineAnnotationTypes,
            sessionIntervals,
            zoomAreaLeft,
            zoomAreaRight,
        ]);

        const onBucketClicked = useCallback(
            (bucketIndex) => {
                const leftProgress = zoomAreaLeft / 100;
                const rightProgress = zoomAreaRight / 100;
                const relProgress = bucketIndex / numberOfBuckets;
                const scale = rightProgress - leftProgress;
                const newTime =
                    (leftProgress + scale * relProgress) * totalTime;
                setTime(newTime);
            },
            [numberOfBuckets, totalTime, setTime, zoomAreaLeft, zoomAreaRight]
        );

        const displayAggregate = useCallback(
            (
                count: number,
                eventType: string,
                firstEventIdentifier?: string
            ) => {
                const Icon = getPlayerEventIcon(eventType);
                return (
                    <Button
                        className={classNames(
                            timelineAnnotationStyles.title,
                            styles.eventTitle
                        )}
                        type="text"
                        trackingId="ViewEventDetail"
                        onClick={() => {
                            if (firstEventIdentifier) {
                                setCurrentEvent(firstEventIdentifier);
                            }
                        }}
                        key={eventType}
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
                );
            },
            [setCurrentEvent]
        );

        const tooltipContent = useCallback(
            (bucketIndex: number | undefined) => {
                if (bucketIndex === undefined) {
                    return;
                }
                const bucket = buckets[bucketIndex];
                const labels = [];
                for (const e of EventsForTimeline) {
                    if (!bucket || !bucket.hasOwnProperty(e)) {
                        break;
                    }
                    const count = bucket[e] as number;
                    const firstEventIdentifier = bucket[`${e}FirstId`] as
                        | string
                        | undefined;
                    if (count > 0 && firstEventIdentifier) {
                        labels.push(
                            displayAggregate(count, e, firstEventIdentifier)
                        );
                    }
                }
                if (labels.length === 0) {
                    return null;
                } else {
                    return <>{labels}</>;
                }
            },
            [buckets, displayAggregate]
        );

        const histogramRef = useRef<HTMLDivElement>(null);
        const middleStripRef = useRef<HTMLDivElement>(null);
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

        return (
            <>
                <ProgressBar activityData={activityData} />
                <div ref={middleStripRef} className={styles.histogramContainer}>
                    <ScrubHandle
                        wrapperWidth={histogramRef.current?.clientWidth || 0}
                        leftTime={(zoomAreaLeft / 100) * totalTime}
                        rightTime={(zoomAreaRight / 100) * totalTime}
                    />
                    <Histogram
                        buckets={buckets}
                        inactivityData={inactivityData}
                        tooltipContent={tooltipContent}
                        onBucketClicked={onBucketClicked}
                        histogramRef={histogramRef}
                        containerRef={middleStripRef}
                    />
                </div>
            </>
        );
    }
);

export default TimelineIndicatorsBarGraph;

function parseSessionInterval(
    interval: ParsedSessionInterval,
    selectedTimelineAnnotationTypes: string[]
): SessionEvent[] {
    const events: SessionEvent[] = [];

    const { endPercent: endProgress, startPercent: startProgress } = interval;
    const intervalRange = endProgress - startProgress;

    const getSessionLoc = (relPercentage: number) => {
        return (intervalRange * (relPercentage || 0)) / 100 + startProgress;
    };

    interval.sessionEvents.forEach((event: ParsedEvent) => {
        if (event.type === 5 && event.relativeIntervalPercentage) {
            const eventType = event.data.tag;

            if (
                !selectedTimelineAnnotationTypes.includes(eventType) ||
                event.relativeIntervalPercentage === undefined
            ) {
                return;
            }

            events.push({
                eventType,
                sessionLoc: getSessionLoc(event.relativeIntervalPercentage),
                identifier: event.identifier,
            });
        }
    });

    if (selectedTimelineAnnotationTypes.includes('Errors')) {
        interval.errors.forEach((error: any) => {
            if (error.relativeIntervalPercentage === undefined) {
                return;
            }

            events.push({
                eventType: 'Errors',
                sessionLoc: getSessionLoc(error.relativeIntervalPercentage),
            });
        });
    }

    if (selectedTimelineAnnotationTypes.includes('Comments')) {
        interval.comments.forEach((comment: any) => {
            if (comment.relativeIntervalPercentage === undefined) {
                return;
            }

            events.push({
                eventType: 'Comments',
                sessionLoc: getSessionLoc(comment.relativeIntervalPercentage),
            });
        });
    }

    return events;
}

function buildEventBuckets(
    events: SessionEvent[],
    leftProgress: number,
    rightProgress: number,
    selectedTimelineAnnotationTypes: string[],
    numberOfBuckets = 50
): EventBucket[] {
    const defaultEventCounts = Object.fromEntries(
        Array.from(selectedTimelineAnnotationTypes).map((eventType) => [
            eventType,
            0,
        ])
    );
    const buckets: any = Array.from({ length: numberOfBuckets }, (_, idx) => ({
        label: idx,
        ...defaultEventCounts,
        totalCount: 0,
    }));

    const scale = rightProgress - leftProgress;
    for (const { eventType, sessionLoc, identifier } of events) {
        const relProgress = (sessionLoc - leftProgress) / scale;
        const bucketId = Math.max(
            Math.min(
                Math.floor(relProgress * numberOfBuckets),
                numberOfBuckets - 1
            ),
            0
        );
        buckets[bucketId][eventType]++;
        buckets[bucketId].totalCount++;
        if (buckets[bucketId][eventType] == 1) {
            buckets[bucketId][`${eventType}FirstId`] = identifier;
        }
    }
    return buckets;
}
