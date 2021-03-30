import {
    playerMetaData,
    SessionInterval,
} from '@highlight-run/rrweb/dist/types';
import { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router';
import { ErrorObject } from '../../../../graph/generated/schemas';
import { ParsedSessionInterval } from '../../ReplayerContext';

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
}

/**
 *
 * @param setTime Sets the new time in milliseconds.
 */
export const useSetPlayerTimestampFromSearchParam = (
    setTime: (newTime: number) => void
) => {
    const history = useHistory();
    const location = useLocation();

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
                }
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
                        setSelectedErrorId(errorId);
                    }
                }
            }
            history.replace(`${location.pathname}`);
        },
        [history, location.pathname, location.search, setTime]
    );

    return {
        /**
         * Sets the player's time based on the search parameter "ts".
         */
        setPlayerTimestamp,
    };
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

    let errorsIndex = 0;
    let sessionIntervalIndex = 0;
    let currentSessionInterval = sessionIntervals[sessionIntervalIndex];

    while (
        errorsIndex < errorsWithTimestamps.length &&
        sessionIntervalIndex < sessionIntervals.length
    ) {
        const error = errorsWithTimestamps[errorsIndex];
        const relativeTimestamp =
            new Date(error.timestamp).getTime() - sessionStartTime;

        if (
            relativeTimestamp >= currentSessionInterval.startTime &&
            relativeTimestamp <= currentSessionInterval.endTime
        ) {
            const relativeTime =
                relativeTimestamp - currentSessionInterval.startTime;
            currentSessionInterval.errors.push({
                ...error,
                relativeIntervalPercentage:
                    (relativeTime / currentSessionInterval.duration) * 100,
            });
            errorsIndex++;
        } else {
            sessionIntervalIndex++;
            currentSessionInterval = sessionIntervals[sessionIntervalIndex];
        }
    }

    return sessionIntervals;
};
