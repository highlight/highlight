import { Replayer } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import { useParams } from '@util/react-router/useParams';
import { H } from 'highlight.run';
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { BooleanParam, useQueryParam } from 'use-query-params';

import { useAuthContext } from '../../../authentication/AuthContext';
import {
    useGetSessionCommentsQuery,
    useGetSessionPayloadLazyQuery,
    useGetSessionQuery,
    useMarkSessionAsViewedMutation,
} from '../../../graph/generated/hooks';
import {
    ErrorObject,
    Session,
    SessionComment,
    SessionResults,
} from '../../../graph/generated/schemas';
import { HighlightEvent } from '../HighlightEvent';
import {
    ParsedHighlightEvent,
    ParsedSessionComment,
    ParsedSessionInterval,
    ReplayerContextInterface,
    ReplayerState,
} from '../ReplayerContext';
import {
    findNextSessionInList,
    getCommentsInSessionIntervals,
    getEventsForTimelineIndicator,
    getSessionIntervals,
    useSetPlayerTimestampFromSearchParam,
} from './utils';
import usePlayerConfiguration from './utils/usePlayerConfiguration';

const urlSearchParams = new URLSearchParams(window.location.search);
/**
 * The number of events to add to Replayer in a frame.
 */
const EVENTS_CHUNK_SIZE = parseInt(
    urlSearchParams.get('chunkSize') || '100000',
    10
);

export enum SessionViewability {
    VIEWABLE,
    EMPTY_SESSION,
    OVER_BILLING_QUOTA,
    ERROR,
}

export const usePlayer = (): ReplayerContextInterface => {
    const { isLoggedIn } = useAuthContext();
    const { session_secure_id, project_id } = useParams<{
        session_secure_id: string;
        project_id: string;
    }>();
    const history = useHistory();

    const [download] = useQueryParam('download', BooleanParam);
    const [scale, setScale] = useState(1);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [sessionComments, setSessionComments] = useState<
        ParsedSessionComment[]
    >([]);
    const [
        eventsForTimelineIndicator,
        setEventsForTimelineIndicator,
    ] = useState<ParsedHighlightEvent[]>([]);
    const [sessionResults, setSessionResults] = useState<SessionResults>({
        sessions: [],
        totalCount: -1,
    });
    const [timerId, setTimerId] = useState<number | null>(null);
    const [errors, setErrors] = useState<ErrorObject[]>([]);
    const [, setSelectedErrorId] = useState<string | undefined>(undefined);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [state, setState] = useState<ReplayerState>(ReplayerState.Empty);
    const [sessionViewability, setSessionViewability] = useState(
        SessionViewability.VIEWABLE
    );
    const [time, setTime] = useState<number>(0);
    const [session, setSession] = useState<undefined | Session>(undefined);
    /** localStorageTime acts like a message broker to share the current player time for components that are outside of the context tree. */
    const {
        setPlayerTime: setPlayerTimeToPersistance,
        autoPlaySessions,
        showPlayerMouseTail,
    } = usePlayerConfiguration();
    const [sessionEndTime, setSessionEndTime] = useState<number>(0);
    const [sessionIntervals, setSessionIntervals] = useState<
        Array<ParsedSessionInterval>
    >([]);
    const {
        setPlayerTimestamp,
        hasSearchParam,
    } = useSetPlayerTimestampFromSearchParam(setTime, replayer);

    const [
        getSessionPayloadQuery,
        { loading: eventsLoading, data: eventsData },
    ] = useGetSessionPayloadLazyQuery({ fetchPolicy: 'no-cache' });

    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();

    const { data: sessionData } = useGetSessionQuery({
        variables: {
            secure_id: session_secure_id,
        },
        onCompleted: (data) => {
            if (data.session?.within_billing_quota) {
                if (isLoggedIn) {
                    markSessionAsViewed({
                        variables: {
                            secure_id: session_secure_id,
                            viewed: true,
                        },
                    });
                }
                getSessionPayloadQuery({
                    variables: {
                        session_secure_id,
                    },
                });
                setSessionViewability(SessionViewability.VIEWABLE);
                H.track('Viewed session', { is_guest: !isLoggedIn });
            } else {
                setSessionViewability(SessionViewability.OVER_BILLING_QUOTA);
            }
        },
        onError: () => {
            setSessionViewability(SessionViewability.ERROR);
        },
        skip: !session_secure_id,
    });
    const {
        data: sessionCommentsData,
        loading: sessionCommentsLoading,
    } = useGetSessionCommentsQuery({
        variables: {
            session_secure_id,
        },
        skip: !session_secure_id,
        // pollInterval: 1000 * 10,
    });

    const resetPlayer = useCallback(
        (nextState?: ReplayerState) => {
            setState(nextState || ReplayerState.Empty);
            setErrors([]);
            setEvents([]);
            setScale(1);
            setSessionComments([]);
            setReplayer(undefined);
            setSelectedErrorId(undefined);
            setTime(0);
            setPlayerTimeToPersistance(0);
            setSessionEndTime(0);
            setSessionIntervals([]);
            setSessionViewability(SessionViewability.VIEWABLE);
        },
        [setPlayerTimeToPersistance]
    );

    // Initializes the session state and fetches the session data
    useEffect(() => {
        if (session_secure_id) {
            setState(ReplayerState.Loading);
            setSession(undefined);
        } else {
            // This case happens when no session is active.
            resetPlayer(ReplayerState.Empty);
        }
    }, [session_secure_id, resetPlayer]);

    useEffect(() => {
        setSession(sessionData?.session as Session | undefined);
    }, [sessionData?.session]);

    // Reset all state when loading events.
    useEffect(() => {
        if (eventsLoading) {
            resetPlayer(ReplayerState.Loading);
        }
    }, [eventsLoading, resetPlayer, setPlayerTimeToPersistance]);

    // Downloads the events data only if the URL search parameter '?download=1' is present.
    useEffect(() => {
        if (download && eventsData) {
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(eventsData.events)], {
                type: 'application/json',
            });

            a.href = URL.createObjectURL(file);
            a.download = `session-${session_secure_id}.json`;
            a.click();

            URL.revokeObjectURL(a.href);
        }
    }, [download, eventsData, session_secure_id]);

    // Handle data in playback mode.
    useEffect(() => {
        if (eventsData?.events?.length ?? 0 > 1) {
            setSessionViewability(SessionViewability.VIEWABLE);
            setState(ReplayerState.Loading);
            // Add an id field to each event so it can be referenced.
            const newEvents: HighlightEvent[] = toHighlightEvents(
                eventsData?.events ?? []
            );
            // Load the first chunk of events. The rest of the events will be loaded in requestAnimationFrame.
            const playerMountingRoot = document.getElementById(
                'player'
            ) as HTMLElement;
            // There are existing children on an already initialized player page. We want to unmount the previously mounted player to mount the new one.
            // Example: User is viewing Session A, they navigate to Session B. The player for Session A needs to be unmounted. If we don't unmount it then there will be 2 players on the page.
            if (playerMountingRoot?.childNodes?.length > 0) {
                while (playerMountingRoot.firstChild) {
                    playerMountingRoot.removeChild(
                        playerMountingRoot.firstChild
                    );
                }
            }
            const r = new Replayer(newEvents.slice(0, EVENTS_CHUNK_SIZE), {
                root: playerMountingRoot,
                triggerFocus: false,
                mouseTail: showPlayerMouseTail,
            });
            r.on('event-cast', (e: any) => {
                const event = e as HighlightEvent;
                if ((event as customEvent)?.data?.tag === 'Stop') {
                    setState(ReplayerState.SessionRecordingStopped);
                }
            });
            setEvents(newEvents);
            if (eventsData?.errors) {
                setErrors(eventsData.errors as ErrorObject[]);
            }
            setReplayer(r);
        } else if (!!eventsData) {
            setSessionViewability(SessionViewability.EMPTY_SESSION);
        }
        // This hook shouldn't depend on `showPlayerMouseTail`. The player is updated through a setter. Making this hook depend on `showPlayerMouseTrail` will cause the player to be remounted when `showPlayerMouseTrail` changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventsData, setPlayerTimeToPersistance]);

    useEffect(() => {
        if (replayer) {
            replayer.setConfig({ mouseTail: showPlayerMouseTail });
        }
    }, [replayer, showPlayerMouseTail]);

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
                    setSessionIntervals(sessionIntervals);
                    setEventsForTimelineIndicator(
                        getEventsForTimelineIndicator(
                            events,
                            replayer.getMetaData().startTime,
                            replayer.getMetaData().totalTime
                        )
                    );
                    setSessionEndTime(replayer.getMetaData().totalTime);
                    setState(
                        hasSearchParam
                            ? ReplayerState.LoadedWithDeepLink
                            : ReplayerState.LoadedAndUntouched
                    );
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors, events, events.length, hasSearchParam, replayer]);

    useEffect(() => {
        if (
            replayer &&
            sessionCommentsData?.session_comments &&
            sessionIntervals.length > 0 &&
            !sessionCommentsLoading
        ) {
            setSessionComments(
                getCommentsInSessionIntervals(
                    sessionCommentsData.session_comments as SessionComment[],
                    replayer.getMetaData().startTime,
                    replayer.getMetaData().totalTime
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
            const frameAction = () => {
                if (replayer) {
                    setTime(replayer.getCurrentTime());

                    if (
                        replayer.getCurrentTime() >=
                        replayer.getMetaData().totalTime
                    ) {
                        setState(ReplayerState.SessionEnded);
                    }
                }
                setTimerId(requestAnimationFrame(frameAction));
            };

            setTimerId(requestAnimationFrame(frameAction));
        }
    }, [state, replayer]);

    useEffect(() => {
        if (state !== ReplayerState.Playing && timerId) {
            cancelAnimationFrame(timerId);
            setTimerId(null);
        }
    }, [state, timerId]);

    useEffect(() => {
        setPlayerTimeToPersistance(time);
    }, [setPlayerTimeToPersistance, time]);

    useEffect(() => {
        if (!session_secure_id) {
            setState(ReplayerState.Empty);
        }
    }, [session_secure_id]);

    // Finds the next session in the session feed to play if autoplay is enabled.
    useEffect(() => {
        if (
            state === ReplayerState.SessionEnded &&
            autoPlaySessions &&
            sessionResults.sessions.length > 0
        ) {
            const nextSessionInList = findNextSessionInList(
                sessionResults.sessions,
                session_secure_id
            );

            if (nextSessionInList) {
                setState(ReplayerState.Paused);
                setTimeout(() => {
                    history.push(
                        `/${project_id}/sessions/${nextSessionInList.id}`
                    );
                    resetPlayer(ReplayerState.Empty);
                }, 250);
            }
        }
    }, [
        autoPlaySessions,
        history,
        project_id,
        resetPlayer,
        sessionResults.sessions,
        session_secure_id,
        state,
    ]);

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
            case ReplayerState.SessionRecordingStopped:
            case ReplayerState.SessionEnded:
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
        sessionComments,
        sessionViewability,
        canViewSession: sessionViewability === SessionViewability.VIEWABLE,
        eventsForTimelineIndicator,
        sessionResults,
        setSessionResults,
        isPlayerReady:
            state !== ReplayerState.Loading &&
            state !== ReplayerState.Empty &&
            scale !== 1 &&
            sessionViewability === SessionViewability.VIEWABLE,
        session,
        playerProgress: replayer
            ? time / replayer.getMetaData().totalTime
            : null,
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
