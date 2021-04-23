import { Replayer, ReplayerEvents } from '@highlight-run/rrweb';
import useLocalStorage from '@rehooks/local-storage';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryParam, BooleanParam } from 'use-query-params';
import { DemoContext } from '../../../DemoContext';
import {
    useGetSessionPayloadQuery,
    useGetSessionCommentsQuery,
} from '../../../graph/generated/hooks';
import { ErrorObject, SessionComment } from '../../../graph/generated/schemas';
import { HighlightEvent } from '../HighlightEvent';

import {
    ParsedSessionComment,
    ParsedSessionInterval,
    ReplayerContextInterface,
    ReplayerState,
} from '../ReplayerContext';
import {
    getCommentsInSessionIntervals,
    addErrorsToSessionIntervals,
    addEventsToSessionIntervals,
    getSessionIntervals,
    useSetPlayerTimestampFromSearchParam,
} from './utils';

const urlSearchParams = new URLSearchParams(window.location.search);
/**
 * The number of events to add to Replayer in a frame.
 */
const EVENTS_CHUNK_SIZE = parseInt(
    urlSearchParams.get('chunkSize') || '100000',
    10
);

export const usePlayer = ({}: { refId: string }): ReplayerContextInterface => {
    const { session_id } = useParams<{ session_id: string }>();

    const [download] = useQueryParam('download', BooleanParam);
    const [scale, setScale] = useState(1);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [sessionCommentIntervals, setSessionCommentIntervals] = useState<
        ParsedSessionComment[][]
    >([]);
    const [errors, setErrors] = useState<ErrorObject[]>([]);
    const [, setSelectedErrorId] = useState<string | undefined>(undefined);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [state, setState] = useState<ReplayerState>(ReplayerState.Loading);
    const [time, setTime] = useState<number>(0);
    /** localStorageTime acts like a message broker to share the current player time for components that are outside of the context tree. */
    const [, setLocalStorageTime] = useLocalStorage('playerTime', time);
    const [sessionEndTime, setSessionEndTime] = useState<number>(0);
    const [sessionIntervals, setSessionIntervals] = useState<
        Array<ParsedSessionInterval>
    >([]);
    const {
        setPlayerTimestamp,
        hasSearchParam,
    } = useSetPlayerTimestampFromSearchParam(setTime, replayer);

    const { demo } = useContext(DemoContext);
    const sessionId = demo
        ? process.env.REACT_APP_DEMO_SESSION ?? ''
        : session_id ?? '';

    const { data: eventsData } = useGetSessionPayloadQuery({
        variables: {
            session_id: sessionId,
        },
        context: { headers: { 'Highlight-Demo': demo } },
        fetchPolicy: 'no-cache',
    });
    const {
        data: sessionCommentsData,
        loading: sessionCommentsLoading,
    } = useGetSessionCommentsQuery({
        variables: {
            session_id: sessionId,
        },
        pollInterval: 5000,
    });

    // Downloads the events data only if the URL search parameter '?download=1' is present.
    useEffect(() => {
        if (download && eventsData) {
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(eventsData.events)], {
                type: 'application/json',
            });

            a.href = URL.createObjectURL(file);
            a.download = `session-${session_id}.json`;
            a.click();

            URL.revokeObjectURL(a.href);
        }
    }, [download, eventsData, session_id]);

    // Handle data in playback mode.
    useEffect(() => {
        if (eventsData?.events?.length ?? 0 > 1) {
            console.time('LoadingEvents');
            setState(ReplayerState.Loading);
            // Add an id field to each event so it can be referenced.
            const newEvents: HighlightEvent[] = toHighlightEvents(
                eventsData?.events ?? []
            );
            // Load the first chunk of events. The rest of the events will be loaded in requestAnimationFrame.
            const r = new Replayer(newEvents.slice(0, EVENTS_CHUNK_SIZE), {
                root: document.getElementById('player') as HTMLElement,
            });
            r.on(ReplayerEvents.Finish, () => {
                setState(ReplayerState.Paused);
            });
            setEvents(newEvents);
            if (eventsData?.errors) {
                setErrors(eventsData.errors as ErrorObject[]);
            }
            setReplayer(r);
        }
    }, [eventsData]);

    // Loads the remaining events into Replayer.
    useEffect(() => {
        if (replayer) {
            let timerId = 0;
            let eventsIndex = EVENTS_CHUNK_SIZE;

            const addEventsWorker = () => {
                events
                    .slice(eventsIndex, eventsIndex + EVENTS_CHUNK_SIZE)
                    .forEach((event) => {
                        replayer.addEvent(event);
                    });
                eventsIndex += EVENTS_CHUNK_SIZE;

                if (eventsIndex > events.length) {
                    cancelAnimationFrame(timerId);

                    const sessionIntervals = getSessionIntervals(
                        replayer.getMetaData(),
                        replayer.getActivityIntervals()
                    );

                    console.log(
                        '[Highlight] Session Metadata:',
                        replayer.getMetaData()
                    );
                    setSessionIntervals(
                        addEventsToSessionIntervals(
                            addErrorsToSessionIntervals(
                                sessionIntervals,
                                errors,
                                replayer.getMetaData().startTime
                            ),
                            events,
                            replayer.getMetaData().startTime
                        )
                    );
                    setSessionEndTime(replayer.getMetaData().totalTime);
                    setState(
                        hasSearchParam
                            ? ReplayerState.LoadedWithDeepLink
                            : ReplayerState.LoadedAndUntouched
                    );
                    console.timeEnd('LoadingEvents');
                    setPlayerTimestamp(
                        replayer.getMetaData().totalTime,
                        replayer.getMetaData().startTime,
                        errors,
                        setSelectedErrorId
                    );
                } else {
                    timerId = requestAnimationFrame(addEventsWorker);
                }
            };

            timerId = requestAnimationFrame(addEventsWorker);

            return () => {
                cancelAnimationFrame(timerId);
            };
        }
    }, [
        errors,
        events,
        events.length,
        hasSearchParam,
        replayer,
        setPlayerTimestamp,
    ]);

    useEffect(() => {
        if (
            replayer &&
            sessionCommentsData?.session_comments &&
            sessionIntervals.length > 0 &&
            !sessionCommentsLoading
        ) {
            setSessionCommentIntervals(
                getCommentsInSessionIntervals(
                    sessionIntervals,
                    sessionCommentsData.session_comments as SessionComment[],
                    replayer.getMetaData().startTime
                )
            );
        }
    }, [
        replayer,
        sessionCommentsData?.session_comments,
        sessionCommentsLoading,
        sessionIntervals,
    ]);

    // "Subscribes" the time with the Replayer when the Player is playing.
    useEffect(() => {
        if (state === ReplayerState.Playing) {
            let timerId: number;

            const frameAction = () => {
                if (replayer) {
                    setTime(replayer.getCurrentTime());
                }
                timerId = requestAnimationFrame(frameAction);
            };

            timerId = requestAnimationFrame(frameAction);

            return () => cancelAnimationFrame(timerId);
        }
    }, [state, replayer]);

    useEffect(() => {
        setLocalStorageTime(time);
    }, [setLocalStorageTime, time]);

    const play = (newTime?: number) => {
        // Don't play the session if the player is already at the end of the session.
        if ((newTime ?? time) >= sessionEndTime) {
            return;
        }
        setState(ReplayerState.Playing);
        setTime(newTime ?? time);
        replayer?.play(newTime);
    };

    const pause = (newTime?: number) => {
        setState(ReplayerState.Paused);
        setTime(newTime ?? time);
        replayer?.pause(newTime);
    };

    /**
     * Wraps the setTime call so we can also forward the setTime request to the Replayer. Without forwarding time and Replayer.getCurrentTime() would be out of sync.
     */
    const setTimeHandler = (newTime?: number) => {
        switch (state) {
            case ReplayerState.Playing:
                play(newTime);
                return;
            case ReplayerState.Paused:
            case ReplayerState.LoadedAndUntouched:
            case ReplayerState.LoadedWithDeepLink:
                pause(newTime);
                return;

            default:
                return;
        }
    };

    return {
        scale,
        setScale,
        time,
        setTime: setTimeHandler,
        sessionIntervals,
        replayer,
        state,
        events,
        play,
        pause,
        errors,
        sessionCommentIntervals,
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
