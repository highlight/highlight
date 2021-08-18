import { Replayer, ReplayerEvents } from '@highlight-run/rrweb';
import { customEvent } from '@highlight-run/rrweb/dist/types';
import { message } from 'antd';
import { H } from 'highlight.run';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { BooleanParam, useQueryParam } from 'use-query-params';

import { useAuthContext } from '../../../authentication/AuthContext';
import {
    useGetSessionCommentsLazyQuery,
    useGetSessionLazyQuery,
    useGetSessionPayloadLazyQuery,
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

export const usePlayer = (): ReplayerContextInterface => {
    const { isLoggedIn } = useAuthContext();
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
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
    const [canViewSession, setCanViewSession] = useState(true);
    const [time, setTime] = useState<number>(0);
    const [session, setSession] = useState<undefined | Session>(undefined);
    /** localStorageTime acts like a message broker to share the current player time for components that are outside of the context tree. */
    const {
        setPlayerTime: setPlayerTimeToPersistance,
        autoPlaySessions,
        showLeftPanel,
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
        { loading, data: eventsData },
    ] = useGetSessionPayloadLazyQuery({
        variables: {
            session_id,
        },
        fetchPolicy: 'no-cache',
    });

    const [getSessionQuery, { data: sessionData }] = useGetSessionLazyQuery({
        variables: {
            id: session_id,
        },
        onCompleted: (data) => {
            if (data.session?.within_billing_quota) {
                getSessionPayloadQuery();
                setCanViewSession(true);
                H.track('Viewed session', { is_guest: !isLoggedIn });
            } else {
                setCanViewSession(false);
            }
        },
    });
    const [
        getSessionCommentsQuery,
        { data: sessionCommentsData, loading: sessionCommentsLoading },
    ] = useGetSessionCommentsLazyQuery({
        variables: {
            session_id,
        },
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
            setCanViewSession(true);
        },
        [setPlayerTimeToPersistance]
    );

    useEffect(() => {
        if (session_id) {
            setState(ReplayerState.Loading);
            setSession(undefined);
            getSessionQuery();
            getSessionCommentsQuery();
        } else {
            resetPlayer(ReplayerState.Empty);
        }
    }, [getSessionCommentsQuery, getSessionQuery, session_id, resetPlayer]);

    useEffect(() => {
        setSession(sessionData?.session as Session | undefined);
    }, [sessionData?.session]);

    // Reset all state when loading events.
    useEffect(() => {
        if (loading) {
            resetPlayer(ReplayerState.Loading);
        }
    }, [loading, resetPlayer, setPlayerTimeToPersistance]);

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
            r.on(ReplayerEvents.Finish, () => {
                setState(ReplayerState.SessionEnded);
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
        }
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
    //     // "Subscribes" the time with the Replayer when the Player is playing.

    useEffect(() => {
        setPlayerTimeToPersistance(time);
    }, [setPlayerTimeToPersistance, time]);

    // Finds the next session in the session feed to play if autoplay is enabled.
    useEffect(() => {
        if (
            state === ReplayerState.SessionEnded &&
            autoPlaySessions &&
            sessionResults.sessions.length > 0
        ) {
            let currentSessionIndex = sessionResults.sessions.findIndex(
                (session) => session.id === session_id
            );

            // This happens if the current session was removed from the session feed.
            if (currentSessionIndex === -1) {
                currentSessionIndex = 0;
            }

            const nextSessionIndex = currentSessionIndex + 1;

            // Don't go beyond the last session.
            if (nextSessionIndex >= sessionResults.sessions.length) {
                message.success('No more sessions to view.');
                return;
            }

            history.push(
                `/${organization_id}/sessions/${sessionResults.sessions[nextSessionIndex].id}`
            );
            resetPlayer(ReplayerState.Loading);
            message.success('Playing the next session.');
        }
    }, [
        autoPlaySessions,
        history,
        organization_id,
        resetPlayer,
        sessionResults.sessions,
        session_id,
        showLeftPanel,
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
        canViewSession,
        eventsForTimelineIndicator,
        sessionResults,
        setSessionResults,
        isPlayerReady:
            state !== ReplayerState.Loading && scale !== 1 && canViewSession,
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
