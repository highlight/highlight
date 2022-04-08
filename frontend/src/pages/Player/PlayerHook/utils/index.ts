import { ErrorObject, Session, SessionComment } from '@graph/schemas';
import { Replayer } from '@highlight-run/rrweb';
import {
    playerMetaData,
    SessionInterval,
} from '@highlight-run/rrweb/dist/types';
import { message } from 'antd';
import * as H from 'history';
import { useCallback, useState } from 'react';
import { useLocation } from 'react-router';

import { MillisToMinutesAndSeconds } from '../../../../util/time';
import { HighlightEvent } from '../../HighlightEvent';
import {
    ParsedErrorObject,
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
                comments: [],
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

export enum PlayerSearchParameters {
    /** The time in the player in seconds. */
    ts = 'ts',
    /** The absolute time in milliseconds. */
    tsAbs = 'tsAbs',
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
    const searchParams = new URLSearchParams(location.search);
    const [hasSearchParam, setHasSearchParam] = useState(
        !!searchParams.get(PlayerSearchParameters.ts) ||
            !!searchParams.get(PlayerSearchParameters.tsAbs) ||
            !!searchParams.get(PlayerSearchParameters.errorId)
    );
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
            } else if (searchParamsObject.get(PlayerSearchParameters.tsAbs)) {
                const absoluteTimestampMilliseconds = parseFloat(
                    searchParamsObject.get(
                        PlayerSearchParameters.tsAbs
                    ) as string
                );
                const relativeTimestampMilliseconds =
                    absoluteTimestampMilliseconds -
                    sessionStartTimeMilliseconds;

                if (
                    relativeTimestampMilliseconds > 0 ||
                    relativeTimestampMilliseconds <= sessionDurationMilliseconds
                ) {
                    setTime(relativeTimestampMilliseconds);
                    replayer?.pause(relativeTimestampMilliseconds);
                }
                setHasSearchParam(true);
            } else if (searchParamsObject.get(PlayerSearchParameters.errorId)) {
                const errorId = searchParamsObject.get(
                    PlayerSearchParameters.errorId
                )!;
                const error = errors.find((e) => e.id === errorId);
                if (error && error.timestamp) {
                    const sessionTime =
                        new Date(error.timestamp).getTime() -
                        sessionStartTimeMilliseconds;
                    if (
                        sessionTime >= 0 ||
                        sessionTime <= sessionDurationMilliseconds
                    ) {
                        // If requestId is defined, time will be set based on the network request instead
                        if (!error.request_id) {
                            setTime(sessionTime);
                            replayer?.pause(sessionTime);
                            message.success(
                                `Changed player time to where error was thrown at ${MillisToMinutesAndSeconds(
                                    sessionTime
                                )}.`
                            );
                        }
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
            } else {
                setHasSearchParam(false);
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
    'Web Vitals',
    'Referrer',
    'TabHidden',
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
 * Adds error events based on the interval that the error was thrown.
 */
export const addEventsToSessionIntervals = (
    sessionIntervals: ParsedSessionInterval[],
    events: HighlightEvent[],
    sessionStartTime: number
): ParsedSessionInterval[] => {
    const eventsToAddToTimeline = events.filter((event) => {
        if (event.type === 5) {
            const data = event.data as any;
            return CustomEventsForTimelineSet.has(data.tag);
        }
        return false;
    });
    const groupedEvents = assignEventToSessionIntervalRelative(
        sessionIntervals,
        eventsToAddToTimeline,
        sessionStartTime
    );

    return sessionIntervals.map((sessionInterval, index) => ({
        ...sessionInterval,
        sessionEvents: groupedEvents[index] as ParsedHighlightEvent[],
    }));
};

/**
 * Adds error events based on the interval that the error was thrown.
 */
export const addErrorsToSessionIntervals = (
    sessionIntervals: ParsedSessionInterval[],
    errors: ErrorObject[],
    sessionStartTime: number
): ParsedSessionInterval[] => {
    const errorsWithTimestamps = errors
        .filter((error) => !!error.timestamp)
        .sort((a, b) => b.timestamp - a.timestamp);

    const groupedErrors = assignEventToSessionIntervalRelative(
        sessionIntervals,
        errorsWithTimestamps,
        sessionStartTime
    );

    return sessionIntervals.map((sessionInterval, index) => ({
        ...sessionInterval,
        errors: groupedErrors[index] as ParsedErrorObject[],
    }));
};

/**
 * Adds events to the session interval that the event occurred in.
 */
const assignEventToSessionIntervalRelative = (
    sessionIntervals: ParsedSessionInterval[],
    events: ParsableEvent[],
    sessionStartTime: number,
    /** Whether the timestamp in events global time or already relative to the session. */
    relativeTime = false
) => {
    let eventIndex = 0;
    let sessionIntervalIndex = 0;
    let currentSessionInterval = sessionIntervals[sessionIntervalIndex];
    const response: ParsedEvent[][] = Array.from(
        Array(sessionIntervals.length)
    ).map(() => []);
    while (
        eventIndex < events.length &&
        sessionIntervalIndex < sessionIntervals.length
    ) {
        const event = events[eventIndex];
        const relativeTimestamp = relativeTime
            ? event.timestamp
            : new Date(event.timestamp).getTime() - sessionStartTime;
        if (relativeTimestamp < currentSessionInterval.startTime) {
            eventIndex++;
        } else if (
            relativeTimestamp >= currentSessionInterval.startTime &&
            relativeTimestamp <= currentSessionInterval.endTime
        ) {
            const relativeTime =
                relativeTimestamp - currentSessionInterval.startTime;
            response[sessionIntervalIndex].push({
                ...event,
                // Calculate at the percentage of time where the event occurred in the session.
                relativeIntervalPercentage:
                    (relativeTime / currentSessionInterval.duration) * 100,
            });
            eventIndex++;
        } else {
            sessionIntervalIndex++;
            currentSessionInterval = sessionIntervals[sessionIntervalIndex];
        }
    }
    return response;
};

/**
 * Returns the comments that are in the respective interval bins. If a comment is in the ith index, then it shows up in the ith session interval.
 */
export const getCommentsInSessionIntervalsRelative = (
    sessionIntervals: ParsedSessionInterval[],
    comments: SessionComment[],
    sessionStartTime: number
): ParsedSessionInterval[] => {
    const newComments = comments.map((comment) => {
        // Set `timestamp` which represents the relative time in the session of when the session feedback was created.
        if (comment.type === 'FEEDBACK') {
            const timestamp =
                new Date(comment.metadata.timestamp).getTime() -
                sessionStartTime;
            return {
                ...comment,
                timestamp,
            };
        }

        return { ...comment };
    });
    const groupedComments = assignEventToSessionIntervalRelative(
        sessionIntervals,
        newComments,
        sessionStartTime,
        true
    );

    return sessionIntervals.map((sessionInterval, index) => ({
        ...sessionInterval,
        comments: groupedComments[index] as ParsedSessionComment[],
    }));
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
    currentSessionSecureId: string
): Session | null => {
    let currentSessionIndex = allSessions.findIndex(
        (session) => session.secure_id === currentSessionSecureId
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

    return allSessions[nextSessionIndex];
};

export const findPreviousSessionInList = (
    allSessions: Session[],
    currentSessionSecureId: string
): Session | null => {
    const currentSessionIndex = allSessions.findIndex(
        (session) => session.secure_id === currentSessionSecureId
    );

    // This happens if the current session was removed from the session feed.
    if (currentSessionIndex < 0) {
        return allSessions[0];
    }

    const nextSessionIndex = currentSessionIndex - 1;

    // Don't go beyond the first session.
    if (nextSessionIndex < 0) {
        return null;
    }

    return allSessions[nextSessionIndex];
};

export const changeSession = (
    projectId: string,
    history: H.History,
    session: Session | null,
    successMessageText = 'Playing the next session.'
) => {
    const projectIdRemapped = projectId === '0' ? 'demo' : projectId;

    if (!session) {
        message.success('No more sessions to play.');
        return;
    }

    history.push(`/${projectIdRemapped}/sessions/${session.secure_id}`);
    message.success(successMessageText);
};
