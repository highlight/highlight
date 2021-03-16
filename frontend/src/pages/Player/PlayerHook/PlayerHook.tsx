import { Replayer, ReplayerEvents } from '@highlight-run/rrweb';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoContext } from '../../../DemoContext';
import { useGetEventsQuery } from '../../../graph/generated/hooks';
import { HighlightEvent } from '../HighlightEvent';

import {
    ParsedSessionInterval,
    ReplayerContextInterface,
    ReplayerState,
} from '../ReplayerContext';
import { getSessionIntervals } from './utils';

/**
 * The number of events to add to Replayer in a frame.
 */
const EVENTS_CHUNK_SIZE = 25;

export const usePlayer = ({}: { refId: string }): ReplayerContextInterface => {
    const { session_id } = useParams<{ session_id: string }>();

    const [scale, setScale] = useState(1);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [state, setState] = useState<ReplayerState>(ReplayerState.Loading);
    const [time, setTime] = useState<number>(0);
    const [sessionEndTime, setSessionEndTime] = useState<number>(0);
    const [sessionIntervals, setSessionIntervals] = useState<
        Array<ParsedSessionInterval>
    >([]);

    const { demo } = useContext(DemoContext);

    const { data: eventsData } = useGetEventsQuery({
        variables: {
            session_id: demo
                ? process.env.REACT_APP_DEMO_SESSION ?? ''
                : session_id ?? '',
        },
        context: { headers: { 'Highlight-Demo': demo } },
        fetchPolicy: 'no-cache',
    });

    // Handle data in playback mode.
    useEffect(() => {
        if (eventsData?.events?.length ?? 0 > 1) {
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
            // Allows users to interact with the DOM in the player.
            r.enableInteract();
            setEvents(newEvents);
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
                    setSessionIntervals(sessionIntervals);
                    setSessionEndTime(replayer.getMetaData().totalTime);
                    setState(ReplayerState.LoadedAndUntouched);
                } else {
                    timerId = requestAnimationFrame(addEventsWorker);
                }
            };

            timerId = requestAnimationFrame(addEventsWorker);

            return () => {
                cancelAnimationFrame(timerId);
            };
        }
    }, [events, events.length, replayer]);

    // "Subscribes" the time with the Replayer when the Player is playing.
    useEffect(() => {
        if (state === ReplayerState.Playing) {
            let timerId: number;

            if (replayer) {
                console.log(replayer?.getMetaData());
                console.log(replayer?.getActivityIntervals());
                const sessionIntervals = getSessionIntervals(
                    replayer?.getMetaData(),
                    replayer?.getActivityIntervals()
                );
                setSessionIntervals(sessionIntervals);
            }
            setSessionIntervals(sessionIntervals);

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
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
