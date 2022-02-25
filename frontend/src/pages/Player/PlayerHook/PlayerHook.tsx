import { datadogLogs } from '@datadog/browser-logs';
import { Replayer } from '@highlight-run/rrweb';
import {
    customEvent,
    viewportResizeDimension,
} from '@highlight-run/rrweb/dist/types';
import {
    findLatestUrl,
    getAllPerformanceEvents,
    getAllUrlEvents,
    getBrowserExtensionScriptURLs,
} from '@pages/Player/SessionLevelBar/utils/utils';
import { useParams } from '@util/react-router/useParams';
import { timerEnd } from '@util/timer/timer';
import { H } from 'highlight.run';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { BooleanParam, useQueryParam } from 'use-query-params';

import { useAuthContext } from '../../../authentication/AuthContext';
import {
    OnSessionPayloadAppendedDocument,
    useGetEventChunksQuery,
    useGetEventChunkUrlQuery,
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
import { HighlightEvent, HighlightPerformancePayload } from '../HighlightEvent';
import {
    ParsedHighlightEvent,
    ParsedSessionInterval,
    RageClick,
    ReplayerContextInterface,
    ReplayerState,
} from '../ReplayerContext';
import {
    addErrorsToSessionIntervals,
    addEventsToSessionIntervals,
    findNextSessionInList,
    getCommentsInSessionIntervalsRelative,
    getEventsForTimelineIndicator,
    getSessionIntervals,
    PlayerSearchParameters,
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
    const { isLoggedIn, isHighlightAdmin } = useAuthContext();
    const { session_secure_id, project_id } = useParams<{
        session_secure_id: string;
        project_id: string;
    }>();
    const history = useHistory();

    const [download] = useQueryParam('download', BooleanParam);
    const [scale, setScale] = useState(1);
    const [
        viewingUnauthorizedSession,
        setViewingUnauthorizedSession,
    ] = useState(false);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [performancePayloads, setPerformancePayloads] = useState<
        Array<HighlightPerformancePayload>
    >([]);
    const [sessionComments, setSessionComments] = useState<SessionComment[]>(
        []
    );
    const [
        eventsForTimelineIndicator,
        setEventsForTimelineIndicator,
    ] = useState<ParsedHighlightEvent[]>([]);
    const [rageClicks, setRageClicks] = useState<RageClick[]>([]);
    const [sessionResults, setSessionResults] = useState<SessionResults>({
        sessions: [],
        totalCount: -1,
    });
    const [loadedEventsIndex, setLoadedEventsIndex] = useState<number>(0);
    const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
    // Browser extension script URLs that are in the session.
    const [
        browserExtensionScriptURLs,
        setBrowserExtensionScriptURLs,
    ] = useState<string[]>([]);
    const [
        unsubscribeSessionPayloadFn,
        setUnsubscribeSessionPayloadFn,
    ] = useState<(() => void) | null>(null);
    const [subscriptionEventsPayload, setSubscriptionEventsPayload] = useState<
        Array<HighlightEvent>
    >([]);
    const lastActiveTimestampRef = useRef(0);
    const [lastActiveString, setLastActiveString] = useState<string | null>(
        null
    );
    const [timerId, setTimerId] = useState<number | null>(null);
    const [errors, setErrors] = useState<ErrorObject[]>([]);
    const [, setSelectedErrorId] = useState<string | undefined>(undefined);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [state, setState] = useState<ReplayerState>(ReplayerState.Empty);
    const [sessionViewability, setSessionViewability] = useState(
        SessionViewability.VIEWABLE
    );
    const [time, setTime] = useState<number>(0);
    const [viewport, setViewport] = useState<
        viewportResizeDimension | undefined
    >(undefined);
    const [currentUrl, setCurrentUrl] = useState<string | undefined>(undefined);
    // Play sessions at a 7s delay to give time for events to be buffered in advance of playback.
    const LIVE_MODE_DELAY = 7000;

    const [session, setSession] = useState<undefined | Session>(undefined);
    /** localStorageTime acts like a message broker to share the current player time for components that are outside of the context tree. */
    const {
        setPlayerTime: setPlayerTimeToPersistance,
        autoPlaySessions,
        showPlayerMouseTail,
        setShowLeftPanel,
        setShowRightPanel,
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
        {
            loading: eventsLoading,
            data: eventsData,
            subscribeToMore: subscribeToSessionPayload,
        },
    ] = useGetSessionPayloadLazyQuery({
        fetchPolicy: 'no-cache',
    });

    const {
        data: eventChunksData,
        loading: eventChunksLoading,
    } = useGetEventChunksQuery({
        variables: { secure_id: session_secure_id },
    });

    const { refetch: fetchEventChunkURL } = useGetEventChunkUrlQuery({
        fetchPolicy: 'no-cache',
        skip: true,
    });

    const [eventsPayload, setEventsPayload] = useState<any[] | undefined>(
        undefined
    );

    // If events are returned by getSessionPayloadQuery, set the events payload
    useEffect(() => {
        if (eventsData?.events) {
            setEventsPayload(eventsData?.events);
        }
    }, [eventsData?.events]);

    useEffect(() => {
        if (subscriptionEventsPayload?.length && eventsPayload) {
            setEventsPayload([...eventsPayload, ...subscriptionEventsPayload]);
            setSubscriptionEventsPayload([]);
        }
    }, [eventsPayload, subscriptionEventsPayload]);

    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();

    const { data: sessionData } = useGetSessionQuery({
        variables: {
            secure_id: session_secure_id,
        },
        onCompleted: (data) => {
            if (data.session === null) {
                setSessionViewability(SessionViewability.ERROR);
            } else if (data.session?.within_billing_quota || isHighlightAdmin) {
                if (!data.session?.within_billing_quota && isHighlightAdmin) {
                    alert(
                        "btw this session is outside of the project's billing quota."
                    );
                }
                // Show the authorization form for Highlight staff if they're trying to access a customer session.
                if (isHighlightAdmin && project_id !== '1') {
                    setViewingUnauthorizedSession(true);
                }
                if (data.session?.last_user_interaction_time) {
                    lastActiveTimestampRef.current = new Date(
                        data.session?.last_user_interaction_time
                    ).getTime();
                }
                if (isLoggedIn && session_secure_id !== 'repro') {
                    markSessionAsViewed({
                        variables: {
                            secure_id: session_secure_id,
                            viewed: true,
                        },
                    });
                }

                const directDownloadUrl = data.session?.direct_download_url;
                if (directDownloadUrl) {
                    setEventsDataLoaded(false);
                    getSessionPayloadQuery({
                        variables: {
                            session_secure_id,
                            skip_events: true,
                        },
                    });
                    fetchEventChunkURL({
                        secure_id: session_secure_id,
                        index: 0,
                    })
                        .then((response) =>
                            fetch(response.data.event_chunk_url)
                        )
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('data', data);
                            setEventsPayload(data || []);
                        })
                        .catch((e) => {
                            setEventsPayload([]);
                            H.consumeError(
                                e,
                                'Error direct downloading session payload'
                            );
                        });
                } else {
                    setEventsDataLoaded(false);
                    getSessionPayloadQuery({
                        variables: {
                            session_secure_id,
                            skip_events: false,
                        },
                    });
                }
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
        fetchPolicy: 'network-only',
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
            setLoadedEventsIndex(0);
            setIsLiveMode(false);
            lastActiveTimestampRef.current = 0;
            setLastActiveString(null);
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

    useEffect(() => {
        if (isLiveMode && eventsData?.events && !unsubscribeSessionPayloadFn) {
            const unsubscribe = subscribeToSessionPayload!({
                document: OnSessionPayloadAppendedDocument,
                variables: {
                    session_secure_id,
                    initial_events_count: eventsData.events.length,
                },
                updateQuery: (prev, { subscriptionData }) => {
                    if (subscriptionData.data) {
                        setSubscriptionEventsPayload(
                            // @ts-ignore The typedef for subscriptionData is incorrect
                            subscriptionData.data!.session_payload_appended
                                .events!
                        );
                        lastActiveTimestampRef.current = new Date(
                            // @ts-ignore The typedef for subscriptionData is incorrect
                            subscriptionData.data!.session_payload_appended.last_user_interaction_time
                        ).getTime();
                    }
                    // Prev is the value in Apollo cache - it is empty, don't bother updating it
                    return prev;
                },
            });
            setUnsubscribeSessionPayloadFn(() => unsubscribe);
            if (state === ReplayerState.Paused) {
                play();
            }
        } else if (!isLiveMode && unsubscribeSessionPayloadFn) {
            unsubscribeSessionPayloadFn!();
            setUnsubscribeSessionPayloadFn(() => null);
            if (state === ReplayerState.Playing) {
                pause();
            }
        }
        // We don't want to re-evaluate this every time the play/pause fn changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLiveMode, eventsData, unsubscribeSessionPayloadFn]);

    // Reset all state when loading events.
    useEffect(() => {
        if (eventsLoading) {
            resetPlayer(ReplayerState.Loading);
        }
    }, [eventsLoading, resetPlayer, setPlayerTimeToPersistance]);

    useEffect(() => {
        const searchParamsObject = new URLSearchParams(location.search);
        if (searchParamsObject.get(PlayerSearchParameters.errorId)) {
            setShowLeftPanel(false);
            setShowRightPanel(true);
        }
    }, [setShowLeftPanel, setShowRightPanel]);

    // Downloads the events data only if the URL search parameter '?download=1' is present.
    useEffect(() => {
        if (download && eventsPayload) {
            const a = document.createElement('a');
            const file = new Blob([JSON.stringify(eventsPayload)], {
                type: 'application/json',
            });

            a.href = URL.createObjectURL(file);
            a.download = `session-${session_secure_id}.json`;
            a.click();

            URL.revokeObjectURL(a.href);
        }
    }, [download, eventsPayload, session_secure_id]);

    // Handle data in playback mode.
    useEffect(() => {
        if (!eventsPayload) return;

        setIsLiveMode(sessionData?.session?.processed === false);
        if (eventsPayload.length < 2) {
            if (!(sessionData?.session?.processed === false)) {
                setSessionViewability(SessionViewability.EMPTY_SESSION);
            }
            return;
        }

        setSessionViewability(SessionViewability.VIEWABLE);
        // Add an id field to each event so it can be referenced.
        const newEvents: HighlightEvent[] = toHighlightEvents(eventsPayload);
        if (loadedEventsIndex <= 0) {
            setState(ReplayerState.Loading);
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
                UNSAFE_replayCanvas: true,
                liveMode: isLiveMode,
            });
            setLoadedEventsIndex(Math.min(EVENTS_CHUNK_SIZE, newEvents.length));

            r.on('event-cast', (e: any) => {
                const event = e as HighlightEvent;
                if ((event as customEvent)?.data?.tag === 'Stop') {
                    setState(ReplayerState.SessionRecordingStopped);
                }
                if (event.type === 5) {
                    switch (event.data.tag) {
                        case 'Navigate':
                        case 'Reload':
                            setCurrentUrl(event.data.payload as string);
                            return;
                        default:
                            return;
                    }
                }
            });
            const onlyScriptEvents = getBrowserExtensionScriptURLs(newEvents);
            setBrowserExtensionScriptURLs(onlyScriptEvents);

            const onlyUrlEvents = getAllUrlEvents(newEvents);
            if (onlyUrlEvents.length >= 1) {
                setCurrentUrl(onlyUrlEvents[0].data.payload);
            }
            setPerformancePayloads(getAllPerformanceEvents(newEvents));
            r.on('resize', (_e) => {
                const e = _e as viewportResizeDimension;
                setViewport(e);
            });
            r.on('pause', () => {
                setCurrentUrl(
                    findLatestUrl(
                        onlyUrlEvents,
                        r.getCurrentTime() + r.getMetaData().startTime
                    )
                );
            });
            r.on('start', () => {
                setCurrentUrl(
                    findLatestUrl(
                        onlyUrlEvents,
                        r.getCurrentTime() + r.getMetaData().startTime
                    )
                );
            });
            setReplayer(r);
            if (isLiveMode) {
                r.startLive(newEvents[0].timestamp);
            }
        }
        setEvents(newEvents);
        // This hook shouldn't depend on `showPlayerMouseTail`. The player is updated through a setter. Making this hook depend on `showPlayerMouseTrail` will cause the player to be remounted when `showPlayerMouseTrail` changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventsPayload, setPlayerTimeToPersistance]);

    const [eventsDataLoaded, setEventsDataLoaded] = useState(false);
    useEffect(() => {
        if (eventsData?.errors) {
            setErrors(eventsData.errors as ErrorObject[]);
        }
        if (eventsData?.session_comments) {
            setSessionComments(eventsData.session_comments as SessionComment[]);
        }
        setEventsDataLoaded(true);
    }, [eventsData]);

    useEffect(() => {
        if (replayer) {
            replayer.setConfig({ mouseTail: showPlayerMouseTail });
        }
    }, [replayer, showPlayerMouseTail]);

    // Loads the remaining events into Replayer.
    useEffect(() => {
        if (replayer && eventsDataLoaded) {
            let timerId = 0;
            let eventsIndex = loadedEventsIndex;

            const addEventsWorker = () => {
                events
                    .slice(eventsIndex, eventsIndex + EVENTS_CHUNK_SIZE)
                    .forEach((event) => {
                        replayer.addEvent(event);
                    });

                eventsIndex = Math.min(
                    events.length,
                    eventsIndex + EVENTS_CHUNK_SIZE
                );

                if (eventsIndex >= events.length) {
                    setLoadedEventsIndex(eventsIndex);
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
                        getCommentsInSessionIntervalsRelative(
                            addEventsToSessionIntervals(
                                addErrorsToSessionIntervals(
                                    sessionIntervals,
                                    errors,
                                    replayer.getMetaData().startTime
                                ),
                                events,
                                replayer.getMetaData().startTime
                            ),
                            sessionComments,
                            replayer.getMetaData().startTime
                        )
                    );
                    setEventsForTimelineIndicator(
                        getEventsForTimelineIndicator(
                            events,
                            replayer.getMetaData().startTime,
                            replayer.getMetaData().totalTime
                        )
                    );
                    setSessionEndTime(replayer.getMetaData().totalTime);
                    if (eventsData?.rage_clicks) {
                        setSessionIntervals((sessionIntervals) => {
                            const allClickEvents: (ParsedHighlightEvent & {
                                sessionIndex: number;
                            })[] = [];

                            sessionIntervals.forEach(
                                (interval, sessionIndex) => {
                                    interval.sessionEvents.forEach((event) => {
                                        if (
                                            event.type === 5 &&
                                            event.data.tag === 'Click'
                                        ) {
                                            allClickEvents.push({
                                                ...event,
                                                sessionIndex,
                                            });
                                        }
                                    });
                                }
                            );

                            const rageClicksWithRelativePositions: RageClick[] = [];

                            eventsData.rage_clicks.forEach((rageClick) => {
                                const rageClickStartUnixTimestamp = new Date(
                                    rageClick.start_timestamp
                                ).getTime();
                                const rageClickEndUnixTimestamp = new Date(
                                    rageClick.end_timestamp
                                ).getTime();
                                /**
                                 * We have this tolerance because time reporting for milliseconds precision is slightly off.
                                 */
                                const DIFFERENCE_TOLERANCE = 100;

                                const matchingStartClickEvent = allClickEvents.find(
                                    (clickEvent) => {
                                        if (
                                            Math.abs(
                                                clickEvent.timestamp -
                                                    rageClickStartUnixTimestamp
                                            ) < DIFFERENCE_TOLERANCE
                                        ) {
                                            return true;
                                        }
                                    }
                                );
                                const matchingEndClickEvent = allClickEvents.find(
                                    (clickEvent) => {
                                        if (
                                            Math.abs(
                                                clickEvent.timestamp -
                                                    rageClickEndUnixTimestamp
                                            ) < DIFFERENCE_TOLERANCE
                                        ) {
                                            return true;
                                        }
                                    }
                                );

                                if (
                                    matchingStartClickEvent &&
                                    matchingEndClickEvent
                                ) {
                                    rageClicksWithRelativePositions.push({
                                        endTimestamp: rageClick.end_timestamp,
                                        startTimestamp:
                                            rageClick.start_timestamp,
                                        totalClicks: rageClick.total_clicks,
                                        startPercentage:
                                            matchingStartClickEvent.relativeIntervalPercentage,
                                        endPercentage:
                                            matchingEndClickEvent.relativeIntervalPercentage,
                                        sessionIntervalIndex:
                                            matchingStartClickEvent.sessionIndex,
                                    } as RageClick);
                                }
                            });

                            setRageClicks(rageClicksWithRelativePositions);
                            return sessionIntervals;
                        });
                    }
                    if (state <= ReplayerState.Loading) {
                        setState(
                            hasSearchParam
                                ? ReplayerState.LoadedWithDeepLink
                                : ReplayerState.LoadedAndUntouched
                        );
                    }
                    setPlayerTimestamp(
                        replayer.getMetaData().totalTime,
                        replayer.getMetaData().startTime,
                        errors,
                        setSelectedErrorId
                    );
                    if (isLiveMode && state > ReplayerState.Loading) {
                        // Resynchronize player timestamp after each batch of events
                        play();
                    }
                } else {
                    timerId = requestAnimationFrame(addEventsWorker);
                }
            };

            setTimeout(addEventsWorker, 0);

            return () => {
                cancelAnimationFrame(timerId);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        errors,
        events,
        events.length,
        hasSearchParam,
        replayer,
        eventsDataLoaded,
    ]);

    // "Subscribes" the time with the Replayer when the Player is playing.
    useEffect(() => {
        if ((state === ReplayerState.Playing || isLiveMode) && !timerId) {
            const frameAction = () => {
                if (replayer) {
                    setTime(replayer.getCurrentTime());

                    if (
                        replayer.getCurrentTime() >=
                        replayer.getMetaData().totalTime
                    ) {
                        setState(
                            isLiveMode
                                ? ReplayerState.Paused // Waiting for more data
                                : ReplayerState.SessionEnded
                        );
                    }
                    // Compute the string rather than number here, so that dependencies don't
                    // have to re-render on every tick
                    updateLastActiveString(Date.now() - LIVE_MODE_DELAY);
                }
                setTimerId(requestAnimationFrame(frameAction));
            };

            setTimerId(requestAnimationFrame(frameAction));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, replayer, isLiveMode]);

    useEffect(() => {
        if (state !== ReplayerState.Playing && !isLiveMode && timerId) {
            cancelAnimationFrame(timerId);
            setTimerId(null);
        }
    }, [state, timerId, isLiveMode]);

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
                        `/${project_id}/sessions/${nextSessionInList.secure_id}`
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
        if (isLiveMode) {
            const desiredTime =
                Date.now() - LIVE_MODE_DELAY - events[0].timestamp;
            // Only jump forwards if the user is more than 5s behind the target, to prevent unnecessary jittering.
            // If we don't have events from that recently (e.g. user is idle), set it to the time of the last event so that
            // the last UI the user idled in is displayed.
            if (desiredTime - time > 5000 || state != ReplayerState.Playing) {
                newTime = Math.min(desiredTime, sessionEndTime - 1);
            } else {
                return;
            }
        }
        // Don't play the session if the player is already at the end of the session.
        if ((newTime ?? time) >= sessionEndTime) {
            return;
        }
        setState(ReplayerState.Playing);
        setTime(newTime ?? time);
        replayer?.play(newTime);

        // Log how long it took to move to the new time.
        const timelineChangeTime = timerEnd('timelineChangeTime');
        console.log({ timelineChangeTime });
        datadogLogs.logger.info('Timeline Change Time', {
            duration: timelineChangeTime,
            sessionId: session?.secure_id,
        });
    };

    const pause = useCallback(
        (newTime?: number) => {
            setIsLiveMode(false);
            setState(ReplayerState.Paused);
            if (newTime !== undefined) {
                setTime(newTime);
            }
            replayer?.pause(newTime);

            // Log how long it took to move to the new time.
            const timelineChangeTime = timerEnd('timelineChangeTime');
            console.log({ timelineChangeTime });
            datadogLogs.logger.info('Timeline Change Time', {
                duration: timelineChangeTime,
                sessionId: session?.secure_id,
            });
        },
        [replayer, session?.secure_id]
    );

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

    const updateLastActiveString = (currentTime: number) => {
        const lastActiveTimestamp = lastActiveTimestampRef.current;
        if (
            isLiveMode &&
            lastActiveTimestamp != 0 &&
            lastActiveTimestamp < currentTime - 5000
        ) {
            if (lastActiveTimestamp > currentTime - 1000 * 60) {
                setLastActiveString('less than a minute ago');
            } else {
                setLastActiveString(
                    moment(lastActiveTimestamp).from(currentTime)
                );
            }
        } else {
            setLastActiveString(null);
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
        rageClicks,
        events,
        performancePayloads,
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
        isLiveMode,
        setIsLiveMode,
        lastActiveString,
        session,
        playerProgress: replayer
            ? time / replayer.getMetaData().totalTime
            : null,
        viewport,
        currentUrl,
        sessionStartDateTime: events.length > 0 ? events[0].timestamp : 0,
        viewingUnauthorizedSession,
        setViewingUnauthorizedSession,
        browserExtensionScriptURLs,
        setBrowserExtensionScriptURLs,
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
