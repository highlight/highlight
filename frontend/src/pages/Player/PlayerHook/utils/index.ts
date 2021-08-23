import { ErrorObject, Session, SessionComment } from '@graph/schemas';
import { Replayer } from '@highlight-run/rrweb';
import {
    playerMetaData,
    SessionInterval,
} from '@highlight-run/rrweb/dist/types';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';

import { HighlightEvent } from '../../HighlightEvent';
import {
    ParsedEvent,
    ParsedHighlightEvent,
    ParsedSessionComment,
    ParsedSessionInterval,
} from '../../ReplayerContext';
import usePlayerConfiguration from './usePlayerConfiguration';

const INACTIVE_THRESHOLD = 0.02;

/**
 * Calculates the active and inactive parts of a session.
 * @param metadata The Replayer's metadata.
 * @param allIntervals The intervals from Replayer. This is a Highlight-specific property.
 * @returns A list of time durations with active/inactive annotations.
 */
export const getSessionIntervals = (
    metadata: playerMetaData,
    allIntervals: SessionInterval[]
): ParsedSessionInterval[] => {
    // The intervals we get from rrweb are sometimes bad. Without special handling, the sessions bar is unusable. We mitigate an unusable slider by providing a single interval. See HIG-211 for context.
    const isBadSession = allIntervals.some((interval) => interval.duration < 0);
    if (isBadSession) {
        return [
            {
                active: true,
                duration: metadata.totalTime,
                endPercent: 1,
                startPercent: 0,
                endTime: metadata.totalTime,
                startTime: 0,
                errors: [],
                sessionEvents: [],
            },
        ];
    }

    const sliderIntervalMap = getIntervalWithPercentages(
        metadata,
        allIntervals
    );

    return sliderIntervalMap;
};

const getIntervalWithPercentages = (
    metadata: playerMetaData,
    allIntervals: SessionInterval[]
): ParsedSessionInterval[] => {
    const intervals = allIntervals.map((e) => ({
        ...e,
        startTime: e.startTime - metadata.startTime,
        endTime: e.endTime - metadata.startTime,
    }));
    const { activeDuration, numInactive } = allIntervals.reduce(
        (acc, interval) => ({
            activeDuration: interval.active
                ? acc.activeDuration + interval.duration
                : acc.activeDuration,
            numInactive: interval.active ? acc.numInactive : ++acc.numInactive,
        }),
        { activeDuration: 0, numInactive: 0 }
    );
    const inactiveSliceDuration = activeDuration
        ? INACTIVE_THRESHOLD * activeDuration
        : 1;
    const totalDuration = activeDuration + inactiveSliceDuration * numInactive;
    let currTime = 0;

    return intervals.map((e) => {
        const prevTime = currTime;
        currTime = currTime + (e.active ? e.duration : inactiveSliceDuration);
        return {
            ...e,
            startPercent: prevTime / totalDuration,
            endPercent: currTime / totalDuration,
            errors: [],
            sessionEvents: [],
            comments: [],
        };
    });
};

/** This is used to set the player time back X milliseconds so the user can see how the error was thrown. Without this the player would be set to when the error was thrown and they wouldn't see why it was thrown. */
const ERROR_TIMESTAMP_LOOK_BACK_MILLISECONDS = 5000;

export enum PlayerSearchParameters {
    /** The time in the player in seconds. */
    ts = 'ts',
    /** The error ID for an error in the current session. The player's time will be set to the lookback period before the error's timestamp. */
    errorId = 'errorId',
    /** The comment ID for a comment in the current session. The player's time will be set to the comments's timestamp. */
    commentId = 'commentId',
}

/**
 *
 * @param setTime Sets the new time in milliseconds.
 */
export const useSetPlayerTimestampFromSearchParam = (
    setTime: (newTime: number) => void,
    replayer?: Replayer
) => {
    const location = useLocation();
    const [hasSearchParam, setHasSearchParam] = useState(false);
    const {
        selectedTimelineAnnotationTypes,
        setSelectedTimelineAnnotationTypes,
    } = usePlayerConfiguration();

    const setPlayerTimestamp = useCallback(
        (
            sessionDurationMilliseconds: number,
            sessionStartTimeMilliseconds: number,
            errors: ErrorObject[],
            setSelectedErrorId: React.Dispatch<
                React.SetStateAction<string | undefined>
            >
        ) => {
            const searchParamsObject = new URLSearchParams(location.search);

            if (searchParamsObject.get(PlayerSearchParameters.ts)) {
                const timestampSeconds = parseFloat(
                    searchParamsObject.get(PlayerSearchParameters.ts) as string
                );
                const timestampMilliseconds = timestampSeconds * 1000;

                if (
                    timestampMilliseconds > 0 ||
                    timestampMilliseconds <= sessionDurationMilliseconds
                ) {
                    setTime(timestampMilliseconds);
                    replayer?.pause(timestampMilliseconds);
                }
                setHasSearchParam(true);
            } else if (searchParamsObject.get(PlayerSearchParameters.errorId)) {
                const errorId = searchParamsObject.get(
                    PlayerSearchParameters.errorId
                )!;
                const error = errors.find((e) => e.id === errorId);
                if (error && error.timestamp) {
                    const delta =
                        new Date(error.timestamp).getTime() -
                        sessionStartTimeMilliseconds;
                    if (delta >= 0 || delta <= sessionDurationMilliseconds) {
                        // Clamp the time to 0.
                        const newTime = Math.max(
                            0,
                            delta - ERROR_TIMESTAMP_LOOK_BACK_MILLISECONDS
                        );
                        setTime(newTime);
                        replayer?.pause(newTime);
                        setSelectedErrorId(errorId);

                        // Show errors on the timeline indicators if deep linked.
                        if (
                            !selectedTimelineAnnotationTypes.includes('Errors')
                        ) {
                            setSelectedTimelineAnnotationTypes([
                                ...selectedTimelineAnnotationTypes,
                                'Errors',
                            ]);
                        }
                    }
                }
                setHasSearchParam(true);
            }
        },
        [
            location.search,
            replayer,
            selectedTimelineAnnotationTypes,
            setSelectedTimelineAnnotationTypes,
            setTime,
        ]
    );

    return {
        /**
         * Sets the player's time based on the search parameter "ts".
         */
        setPlayerTimestamp,
        /** Whether the current page had a search param that needed to be handled. */
        hasSearchParam,
    };
};

/** These are the type of custom events that will show up as annotations on the timeline. */
const CustomEventsForTimeline = [
    'Click',
    'Focus',
    'Reload',
    'Navigate',
    'Segment',
    'Track',
    'Comments',
    'Viewport',
    'Identify',
] as const;
const CustomEventsForTimelineSet = new Set(CustomEventsForTimeline);

export const EventsForTimeline = [
    ...CustomEventsForTimeline,
    'Errors',
] as const;

export type EventsForTimelineKeys = typeof EventsForTimeline;

/**
 * Gets events for the timeline indicator based on the type of event.
 */
export const getEventsForTimelineIndicator = (
    events: HighlightEvent[],
    sessionStartTime: number,
    sessionTotalTime: number
): ParsedHighlightEvent[] => {
    const eventsToAddToTimeline = events.filter((event) => {
        if (event.type === 5) {
            const data = event.data as any;
            return CustomEventsForTimelineSet.has(data.tag);
        }
        return false;
    });

    const groupedEvents = assignEventToSessionInterval(
        eventsToAddToTimeline,
        sessionStartTime,
        sessionTotalTime
    );

    return groupedEvents as ParsedHighlightEvent[];
};

/**
 * Returns the comments that are in the respective interval bins. If a comment is in the ith index, then it shows up in the ith session interval.
 */
export const getCommentsInSessionIntervals = (
    comments: SessionComment[],
    sessionStartTime: number,
    sessionTotalTime: number
): ParsedSessionComment[] => {
    return assignEventToSessionInterval(
        comments,
        sessionStartTime,
        sessionTotalTime,
        true
    ) as ParsedSessionComment[];
};

type ParsableEvent = ErrorObject | HighlightEvent | SessionComment;

/**
 * Adds events to the session interval that the event occurred in.
 */
const assignEventToSessionInterval = (
    events: ParsableEvent[],
    sessionStartTime: number,
    sessionTotalTime: number,
    /** Whether the timestamp in events global time or already relative to the session. */
    relativeTime = false
) => {
    const response: ParsedEvent[] = [];

    events.forEach((event) => {
        const relativeTimestamp = relativeTime
            ? event.timestamp
            : new Date(event.timestamp).getTime() - sessionStartTime;

        response.push({
            ...event,
            relativeIntervalPercentage:
                (relativeTimestamp / sessionTotalTime) * 100,
        });
    });

    return response;
};

export const findNextSessionInList = (
    allSessions: Session[],
    currentSessionId: string
): number | null => {
    let currentSessionIndex = allSessions.findIndex(
        (session) => session.id === currentSessionId
    );

    // This happens if the current session was removed from the session feed.
    if (currentSessionIndex === -1) {
        currentSessionIndex = 0;
    }

    const nextSessionIndex = currentSessionIndex + 1;

    // Don't go beyond the last session.
    if (nextSessionIndex >= allSessions.length) {
        return null;
    }

    return nextSessionIndex;
};

export const findPreviousSessionInList = (
    allSessions: Session[],
    currentSessionId: string
): number | null => {
    const currentSessionIndex = allSessions.findIndex(
        (session) => session.id === currentSessionId
    );

    // This happens if the current session was removed from the session feed.
    if (currentSessionIndex < 0) {
        return 0;
    }

    const nextSessionIndex = currentSessionIndex - 1;

    // Don't go beyond the first session.
    if (nextSessionIndex < 0) {
        return null;
    }

    return nextSessionIndex;
};
