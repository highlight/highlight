import { useAuthContext } from '@authentication/AuthContext';
import { datadogLogs } from '@datadog/browser-logs';
import {
    OnSessionPayloadAppendedDocument,
    useGetEventChunksQuery,
    useGetEventChunkUrlQuery,
    useGetSessionIntervalsQuery,
    useGetSessionPayloadLazyQuery,
    useGetSessionQuery,
    useGetTimelineIndicatorEventsQuery,
    useMarkSessionAsViewedMutation,
} from '@graph/hooks';
import {
    ErrorObject,
    Session,
    SessionComment,
    SessionResults,
} from '@graph/schemas';
import { Replayer } from '@highlight-run/rrweb';
import {
    customEvent,
    playerMetaData,
    SessionInterval,
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
import useMap from '@util/useMap';
import { H } from 'highlight.run';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { BooleanParam, useQueryParam } from 'use-query-params';

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

const LOOKAHEAD_MS = 30000;
const MAX_CHUNK_COUNT = 5;
const EMPTY_SESSION_METADATA = {
    startTime: 0,
    endTime: 0,
    totalTime: 0,
};
const CHUNKING_DISABLED_PROJECTS: string[] = [];

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
    const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
    // Browser extension script URLs that are in the session.
    const [
        browserExtensionScriptURLs,
        setBrowserExtensionScriptURLs,
    ] = useState<string[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
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
        skipInactive,
    } = usePlayerConfiguration();
    const [sessionEndTime, setSessionEndTime] = useState<number>(0);
    const [sessionIntervals, setSessionIntervals] = useState<
        Array<ParsedSessionInterval>
    >([]);
    const {
        setPlayerTimestamp,
        hasSearchParam,
    } = useSetPlayerTimestampFromSearchParam(setTime, replayer);
    // Tracks the start/end/total time for a session. Using replayer.getMetaData is
    // no longer accurate because the first or last event chunks might not be loaded.
    const [sessionMetadata, setSessionMetadata] = useState<playerMetaData>(
        EMPTY_SESSION_METADATA
    );
    const [events, setEvents] = useState<HighlightEvent[]>([]);
    // Incremented whenever events are received in live mode. This is subscribed
    // to for knowing when new live events are available to add to the player.
    const [liveEventCount, setLiveEventCount] = useState<number>(0);

    const { data: sessionIntervalsData } = useGetSessionIntervalsQuery({
        variables: {
            session_secure_id: session_secure_id,
        },
    });
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

    const { data: eventChunksData } = useGetEventChunksQuery({
        variables: { secure_id: session_secure_id },
        skip: CHUNKING_DISABLED_PROJECTS.includes(project_id),
    });

    const [
        chunkEvents,
        chunkEventsSet,
        chunkEventsSetMulti,
        chunkEventsRemove,
        chunkEventsReset,
    ] = useMap<number, HighlightEvent[]>();

    const [onEventsLoaded, setOnEventsLoaded] = useState<() => void>();

    // eventsKey represents the chunk index for all loaded chunks. This is
    // subscribed to for knowing when new chunks have been loaded in or removed.
    let eventsKey = '';
    const sortedChunks = [...chunkEvents.entries()].sort((a, b) => a[0] - b[0]);
    for (const [k, v] of sortedChunks) {
        if (v.length !== 0) {
            eventsKey += k + ',';
        }
    }

    const { refetch: fetchEventChunkURL } = useGetEventChunkUrlQuery({
        fetchPolicy: 'no-cache',
        skip: true,
    });

    // If events are returned by getSessionPayloadQuery, set the events payload
    useEffect(() => {
        if (!!eventsData?.events && chunkEvents.size === 0) {
            chunkEventsSet(0, toHighlightEvents(eventsData?.events));
        }
    }, [eventsData?.events, chunkEvents.size, chunkEventsSet]);

    useEffect(() => {
        if (subscriptionEventsPayload?.length) {
            chunkEventsSet(0, [
                ...(chunkEvents.get(0) ?? []),
                ...toHighlightEvents(subscriptionEventsPayload),
            ]);
            setLiveEventCount((cur) => cur + 1);
            setSubscriptionEventsPayload([]);
        }
    }, [chunkEvents, chunkEventsSet, subscriptionEventsPayload]);

    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();

    const getChunkIdx = useCallback(
        (ts: number) => {
            let idx = 0;
            eventChunksData?.event_chunks?.forEach((chunk, i) => {
                if (chunk.timestamp <= ts) {
                    idx = i;
                }
            });
            return idx;
        },
        [eventChunksData?.event_chunks]
    );

    const onevent = (e: any) => {
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
    };

    const {
        data: timelineIndicatorEventsData,
    } = useGetTimelineIndicatorEventsQuery({
        variables: {
            session_secure_id: session_secure_id,
        },
    });

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

                    let fetchEvents;
                    if (
                        data.session?.chunked &&
                        !CHUNKING_DISABLED_PROJECTS.includes(project_id)
                    ) {
                        fetchEvents = fetchEventChunkURL({
                            secure_id: session_secure_id,
                            index: 0,
                        }).then((response) =>
                            fetch(response.data.event_chunk_url)
                        );
                    } else {
                        fetchEvents = fetch(directDownloadUrl);
                    }

                    fetchEvents
                        .then((response) => response.json())
                        .then((data) => {
                            chunkEventsSet(0, toHighlightEvents(data || []));
                        })
                        .catch((e) => {
                            chunkEventsSet(0, []);
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

    const getChunkToRemove = useCallback(
        (
            chunkEvents: Omit<
                Map<number, HighlightEvent[]>,
                'set' | 'clear' | 'delete'
            >,
            time: number
        ): number | undefined => {
            const timestamp = sessionMetadata.startTime + time;
            const curIdx = getChunkIdx(timestamp);

            // Get the count of non-empty chunks, as well as the
            // min and max idx of non-empty chunks.
            let minIdx: number | undefined = undefined;
            let maxIdx: number | undefined = undefined;
            let count = 0;
            for (const [k, v] of chunkEvents) {
                if (v.length !== 0) {
                    count++;

                    if (minIdx === undefined || k < minIdx) {
                        minIdx = k;
                    }

                    if (maxIdx === undefined || k > maxIdx) {
                        maxIdx = k;
                    }
                }
            }

            // If there are more than the max chunks loaded, try removing
            // the earliest. If we're currently playing the earliest chunk,
            // remove the latest instead.
            let toRemove: number | undefined = undefined;
            if (count > MAX_CHUNK_COUNT - 1) {
                if (minIdx !== undefined && curIdx !== minIdx) {
                    toRemove = minIdx;
                } else if (maxIdx !== undefined) {
                    toRemove = maxIdx;
                }
            }

            return toRemove;
        },
        [getChunkIdx, sessionMetadata.startTime]
    );

    // Ensure all chunks between startTs and endTs are loaded. If a callback
    // is passed in, invoke it once the chunks are loaded.
    const ensureChunksLoaded = useCallback(
        (startTs: number, endTs?: number, callback?: () => void) => {
            if (
                CHUNKING_DISABLED_PROJECTS.includes(project_id) ||
                !sessionData?.session?.chunked
            ) {
                return false;
            }

            const startIdx = getChunkIdx(startTs);
            const endIdx = endTs ? getChunkIdx(endTs) : startIdx;

            let needsLoad = false;
            for (let i = startIdx; i <= endIdx; i++) {
                if (!chunkEvents.has(i)) {
                    chunkEventsSet(i, []);

                    needsLoad = true;
                    fetchEventChunkURL({
                        secure_id: session_secure_id,
                        index: i,
                    })
                        .then((response) =>
                            fetch(response.data.event_chunk_url)
                        )
                        .then((response) => response.json())
                        .then((data) => {
                            const toRemove = getChunkToRemove(
                                chunkEvents,
                                startTs
                            );
                            const toSet: [
                                number,
                                HighlightEvent[] | undefined
                            ][] = [[i, toHighlightEvents(data)]];
                            if (toRemove !== undefined) {
                                toSet.push([toRemove, undefined]);
                            }
                            chunkEventsSetMulti(toSet);
                        })
                        .then(() => setOnEventsLoaded(callback))
                        .catch((e) => {
                            chunkEventsSet(i, []);
                            H.consumeError(
                                e,
                                'Error direct downloading session payload'
                            );
                        });
                }
            }

            return needsLoad;
        },
        [
            project_id,
            sessionData?.session?.chunked,
            getChunkIdx,
            chunkEvents,
            chunkEventsSet,
            fetchEventChunkURL,
            session_secure_id,
            getChunkToRemove,
            chunkEventsSetMulti,
        ]
    );

    const resetPlayer = useCallback(
        (nextState?: ReplayerState) => {
            setState(nextState || ReplayerState.Empty);
            setErrors([]);
            chunkEventsReset();
            setScale(1);
            setSessionComments([]);
            setReplayer(undefined);
            setSelectedErrorId(undefined);
            setTime(0);
            setPlayerTimeToPersistance(0);
            setSessionEndTime(0);
            setSessionIntervals([]);
            setSessionViewability(SessionViewability.VIEWABLE);
            setIsLiveMode(false);
            lastActiveTimestampRef.current = 0;
            setLastActiveString(null);
            setSessionMetadata(EMPTY_SESSION_METADATA);
        },
        [setPlayerTimeToPersistance, chunkEventsReset]
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
        if (
            isLiveMode &&
            eventsData?.events &&
            !unsubscribeSessionPayloadFn &&
            subscribeToSessionPayload
        ) {
            const unsubscribe = subscribeToSessionPayload({
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

    const loadiFrameResources = (r: Replayer) => {
        // Inject the Material font icons into the player if it's a Boardgent session.
        // Context: https://linear.app/highlight/issue/HIG-1996/support-loadingsaving-resources-that-are-not-available-on-the-open-web
        if (project_id === '669' && r.iframe.contentDocument) {
            const cssLink = document.createElement('link');
            cssLink.href =
                'https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css';
            cssLink.rel = 'stylesheet';
            cssLink.type = 'text/css';
            r.iframe.contentDocument.head.appendChild(cssLink);
        }
        // Inject FontAwesome for Gelt Finance sessions.
        // Context: https://linear.app/highlight/issue/HIG-2232/fontawesome-library
        if (project_id === '896' && r.iframe.contentDocument) {
            const scriptLink = document.createElement('script');
            scriptLink.src = 'https://kit.fontawesome.com/2fb433086f.js';
            scriptLink.crossOrigin = 'anonymous';
            r.iframe.contentDocument.head.appendChild(scriptLink);
        }
    };

    const initReplayer = (newEvents: HighlightEvent[]) => {
        setState(ReplayerState.Loading);
        // Load the first chunk of events. The rest of the events will be loaded in requestAnimationFrame.
        const playerMountingRoot = document.getElementById(
            'player'
        ) as HTMLElement;
        // There are existing children on an already initialized player page. We want to unmount the previously mounted player to mount the new one.
        // Example: User is viewing Session A, they navigate to Session B. The player for Session A needs to be unmounted. If we don't unmount it then there will be 2 players on the page.
        if (playerMountingRoot?.childNodes?.length > 0) {
            while (playerMountingRoot.firstChild) {
                playerMountingRoot.removeChild(playerMountingRoot.firstChild);
            }
        }

        const r = new Replayer(newEvents, {
            root: playerMountingRoot,
            triggerFocus: false,
            mouseTail: showPlayerMouseTail,
            UNSAFE_replayCanvas: true,
            liveMode: isLiveMode,
        });

        const onlyScriptEvents = getBrowserExtensionScriptURLs(newEvents);
        setBrowserExtensionScriptURLs(onlyScriptEvents);

        const onlyUrlEvents = getAllUrlEvents(newEvents);
        if (onlyUrlEvents.length >= 1) {
            setCurrentUrl(onlyUrlEvents[0].data.payload);
        }
        setPerformancePayloads(getAllPerformanceEvents(newEvents));
        r.on('event-cast', onevent);
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
            const newTs = r.getCurrentTime() + r.getMetaData().startTime;
            setCurrentUrl(findLatestUrl(onlyUrlEvents, newTs));
            loadiFrameResources(r);
        });
        setReplayer(r);
        if (isLiveMode) {
            r.startLive(newEvents[0].timestamp);
        }
    };

    // Downloads the events data only if the URL search parameter '?download=1' is present.
    useEffect(() => {
        if (download) {
            const directDownloadUrl = sessionData?.session?.direct_download_url;

            if (directDownloadUrl) {
                const handleDownload = (events: HighlightEvent[]): void => {
                    const a = document.createElement('a');
                    const file = new Blob([JSON.stringify(events)], {
                        type: 'application/json',
                    });

                    a.href = URL.createObjectURL(file);
                    a.download = `session-${session_secure_id}.json`;
                    a.click();

                    URL.revokeObjectURL(a.href);
                };

                fetch(directDownloadUrl)
                    .then((response) => response.json())
                    .then((data) => {
                        return toHighlightEvents(data || []);
                    })
                    .then(handleDownload)
                    .catch((e) => {
                        H.consumeError(
                            e,
                            'Error direct downloading session payload for download'
                        );
                    });
            }
        }
    }, [
        download,
        sessionData?.session?.direct_download_url,
        session_secure_id,
    ]);

    // Handle data in playback mode.
    useEffect(() => {
        const nextEvents: HighlightEvent[] = [];
        for (const v of chunkEvents.values()) {
            for (const val of v) {
                nextEvents.push(val);
            }
        }

        if (!nextEvents || nextEvents.length === 0) return;

        setIsLiveMode(sessionData?.session?.processed === false);
        if (nextEvents.length < 2) {
            if (!(sessionData?.session?.processed === false)) {
                setSessionViewability(SessionViewability.EMPTY_SESSION);
            }
            return;
        }

        setSessionViewability(SessionViewability.VIEWABLE);
        // Add an id field to each event so it can be referenced.

        if (replayer === undefined) {
            initReplayer(nextEvents);
        }

        setEvents(nextEvents);

        // This hook shouldn't depend on `showPlayerMouseTail`. The player is updated through a setter. Making this hook depend on `showPlayerMouseTrail` will cause the player to be remounted when `showPlayerMouseTrail` changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chunkEvents, eventChunksData]);

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
        if (replayer && eventsDataLoaded && eventsKey !== '') {
            const events: HighlightEvent[] = [];
            for (const [, v] of sortedChunks) {
                for (const val of v) {
                    events.push(val);
                }
            }
            replayer.replaceEvents(events);

            // Preprocess session interval data from backend
            const parsedSessionIntervalsData: SessionInterval[] =
                sessionIntervalsData &&
                sessionIntervalsData.session_intervals.length > 0
                    ? sessionIntervalsData.session_intervals.map((interval) => {
                          return {
                              startTime: new Date(
                                  interval.start_time
                              ).getTime(),
                              endTime: new Date(interval.end_time).getTime(),
                              duration: interval.duration,
                              active: interval.active,
                          };
                      })
                    : replayer.getActivityIntervals();
            const sessionMetadata: playerMetaData = parsedSessionIntervalsData
                ? {
                      startTime: new Date(
                          parsedSessionIntervalsData[0].startTime
                      ).getTime(),
                      endTime: new Date(
                          parsedSessionIntervalsData[
                              parsedSessionIntervalsData.length - 1
                          ].endTime
                      ).getTime(),
                      totalTime:
                          new Date(
                              parsedSessionIntervalsData[
                                  parsedSessionIntervalsData.length - 1
                              ].endTime
                          ).getTime() -
                          new Date(
                              parsedSessionIntervalsData[0].startTime
                          ).getTime(),
                  }
                : replayer.getMetaData();

            const sessionIntervals = getSessionIntervals(
                sessionMetadata,
                parsedSessionIntervalsData
            );

            const parsedTimelineIndicatorEvents =
                timelineIndicatorEventsData &&
                timelineIndicatorEventsData.timeline_indicator_events.length > 0
                    ? toHighlightEvents(
                          timelineIndicatorEventsData.timeline_indicator_events
                      )
                    : events;
            const si = getCommentsInSessionIntervalsRelative(
                addEventsToSessionIntervals(
                    addErrorsToSessionIntervals(
                        sessionIntervals,
                        errors,
                        sessionMetadata.startTime
                    ),
                    parsedTimelineIndicatorEvents,
                    sessionMetadata.startTime
                ),
                sessionComments,
                sessionMetadata.startTime
            );
            setSessionIntervals(si);
            const test = getEventsForTimelineIndicator(
                parsedTimelineIndicatorEvents,
                sessionMetadata.startTime,
                sessionMetadata.totalTime
            );
            setEventsForTimelineIndicator(test);
            setSessionEndTime(sessionMetadata.endTime);

            if (eventsData?.rage_clicks) {
                setSessionIntervals((sessionIntervals) => {
                    const allClickEvents: (ParsedHighlightEvent & {
                        sessionIndex: number;
                    })[] = [];

                    sessionIntervals.forEach((interval, sessionIndex) => {
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
                    });

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

                        if (matchingStartClickEvent && matchingEndClickEvent) {
                            rageClicksWithRelativePositions.push({
                                endTimestamp: rageClick.end_timestamp,
                                startTimestamp: rageClick.start_timestamp,
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
                sessionMetadata.totalTime,
                sessionMetadata.startTime,
                errors,
                setSelectedErrorId
            );
            setSessionMetadata(sessionMetadata);
            if (isLiveMode && state > ReplayerState.Loading) {
                // Resynchronize player timestamp after each batch of events
                play();
            }
            // If there is a callback set to run on load, invoke it
            onEventsLoaded && onEventsLoaded();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        errors,
        eventsKey,
        hasSearchParam,
        replayer,
        eventsDataLoaded,
        liveEventCount,
    ]);

    // "Subscribes" the time with the Replayer when the Player is playing.
    useEffect(() => {
        if ((state === ReplayerState.Playing || isLiveMode) && !timerId) {
            const frameAction = () => {
                if (replayer) {
                    // The player may start later than the session if earlier events are unloaded
                    const timeOffset =
                        replayer.getMetaData().startTime -
                        sessionMetadata.startTime;

                    setTime(replayer.getCurrentTime() + timeOffset);

                    if (
                        replayer.getCurrentTime() + timeOffset >=
                        sessionMetadata.totalTime
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

    const play = useCallback(
        (newTime?: number) => {
            const timeChanged = newTime !== time;
            if (isLiveMode) {
                // Return if no events
                if (events.length === 0) {
                    return;
                }

                const desiredTime =
                    Date.now() - LIVE_MODE_DELAY - events[0].timestamp;
                // Only jump forwards if the user is more than 5s behind the target, to prevent unnecessary jittering.
                // If we don't have events from that recently (e.g. user is idle), set it to the time of the last event so that
                // the last UI the user idled in is displayed.
                if (
                    desiredTime - time > 5000 ||
                    state != ReplayerState.Playing
                ) {
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

            const newTs =
                (newTime ?? time ?? 0) + (sessionMetadata.startTime ?? 0);
            const newTimeWithOffset =
                replayer === undefined || newTime === undefined
                    ? undefined
                    : newTime -
                      replayer.getMetaData().startTime +
                      sessionMetadata.startTime;

            const needsLoad = ensureChunksLoaded(newTs, undefined, () => {
                setIsLoadingEvents(false);
                if (replayer?.iframe.contentWindow !== null) {
                    replayer?.play(newTimeWithOffset);
                }
            });
            if (timeChanged || needsLoad) {
                setIsLoadingEvents(true);
            }
            setTimeout(() => {
                if (needsLoad) {
                    replayer?.pause();
                } else {
                    replayer?.play(newTimeWithOffset);
                    setIsLoadingEvents(false);
                }

                // Log how long it took to move to the new time.
                const timelineChangeTime = timerEnd('timelineChangeTime');
                console.log({ timelineChangeTime });
                datadogLogs.logger.info('Timeline Change Time', {
                    duration: timelineChangeTime,
                    sessionId: session?.secure_id,
                });
            });
        },
        [
            ensureChunksLoaded,
            events,
            isLiveMode,
            replayer,
            session?.secure_id,
            sessionEndTime,
            sessionMetadata.startTime,
            state,
            time,
        ]
    );

    const pause = useCallback(
        (newTime?: number) => {
            const timeChanged = newTime !== time;
            setIsLiveMode(false);
            setState(ReplayerState.Paused);
            if (newTime !== undefined) {
                setTime(newTime);
            }

            const newTs = (newTime ?? 0) + sessionMetadata.startTime;
            const newTimeWithOffset =
                replayer === undefined || newTime === undefined
                    ? undefined
                    : newTime -
                      replayer.getMetaData().startTime +
                      sessionMetadata.startTime;

            const needsLoad = ensureChunksLoaded(newTs, undefined, () => {
                setIsLoadingEvents(false);
                if (replayer?.iframe.contentWindow !== null) {
                    replayer?.pause(newTimeWithOffset);
                }
            });

            if (timeChanged || needsLoad) {
                setIsLoadingEvents(true);
            }
            setTimeout(() => {
                if (needsLoad) {
                    replayer?.pause();
                } else {
                    replayer?.pause(newTimeWithOffset);
                    setIsLoadingEvents(false);
                }

                // Log how long it took to move to the new time.
                const timelineChangeTime = timerEnd('timelineChangeTime');
                console.log({ timelineChangeTime });
                datadogLogs.logger.info('Timeline Change Time', {
                    duration: timelineChangeTime,
                    sessionId: session?.secure_id,
                });
            });
        },
        [
            ensureChunksLoaded,
            replayer,
            session?.secure_id,
            sessionMetadata.startTime,
            time,
        ]
    );

    // Returns the player-relative timestamp of the end of the current inactive interval.
    // Returns undefined if not in an interval or the interval is marked as active.
    const getInactivityEnd = useCallback(
        (time: number): number | undefined => {
            for (const interval of sessionIntervals) {
                if (time >= interval.startTime && time < interval.endTime) {
                    if (!interval.active) {
                        return interval.endTime;
                    } else {
                        return undefined;
                    }
                }
            }
            return undefined;
        },
        [sessionIntervals]
    );

    useEffect(() => {
        if (sessionMetadata.startTime !== 0) {
            const timestamp = sessionMetadata.startTime + time;

            ensureChunksLoaded(timestamp, timestamp + LOOKAHEAD_MS);

            // If the player is in an inactive interval, skip to the end of it
            if (skipInactive) {
                const inactivityEnd = getInactivityEnd(time);
                if (
                    inactivityEnd !== undefined &&
                    state === ReplayerState.Playing
                ) {
                    setIsLoadingEvents(true);
                    play(inactivityEnd);
                    setInterval(() => setIsLoadingEvents(false));
                }
            }
        }
    }, [
        chunkEvents,
        chunkEventsRemove,
        ensureChunksLoaded,
        getChunkIdx,
        time,
        state,
        play,
        getInactivityEnd,
        sessionMetadata.startTime,
        skipInactive,
    ]);

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
            if (lastActiveString !== null) {
                setLastActiveString(null);
            }
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
        playerProgress: replayer ? time / sessionMetadata.totalTime : null,
        viewport,
        currentUrl,
        sessionStartDateTime: events.length > 0 ? events[0].timestamp : 0,
        viewingUnauthorizedSession,
        setViewingUnauthorizedSession,
        browserExtensionScriptURLs,
        setBrowserExtensionScriptURLs,
        isLoadingEvents,
        setIsLoadingEvents,
        sessionMetadata,
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
