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

export const usePlayer = ({
    refId,
}: {
    refId: string;
}): ReplayerContextInterface => {
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
    });

    // Handle data in playback mode.
    useEffect(() => {
        if (eventsData?.events?.length ?? 0 > 1) {
            setState(ReplayerState.Loading);
            // Add an id field to each event so it can be referenced.
            const newEvents: HighlightEvent[] = toHighlightEvents(
                eventsData?.events ?? []
            );
            const inactiveThreshold = 0.02;
            let r = new Replayer(newEvents, {
                root: document.getElementById('player') as HTMLElement,
            });
            r.on(ReplayerEvents.Finish, () => {
                setState(ReplayerState.Paused);
            });
            // Preprocess and logic for player length with inactive sessions
            let metadata = r.getMetaData();
            const allIntervals = r.getActivityIntervals();
            let intervals = allIntervals.map((e) => ({
                ...e,
                startTime: e.startTime - metadata.startTime,
                endTime: e.endTime - metadata.startTime,
            }));
            const { activeDuration, numInactive } = allIntervals.reduce(
                (acc, interval) => ({
                    activeDuration: interval.active
                        ? acc.activeDuration + interval.duration
                        : acc.activeDuration,
                    numInactive: interval.active
                        ? acc.numInactive
                        : ++acc.numInactive,
                }),
                { activeDuration: 0, numInactive: 0 }
            );
            const inactiveSliceDuration = inactiveThreshold * activeDuration;
            const totalDuration =
                activeDuration * (1 + inactiveThreshold * numInactive);
            let currTime = 0;
            const sliderIntervalMap = intervals.map((e) => {
                const prevTime = currTime;
                currTime =
                    currTime + (e.active ? e.duration : inactiveSliceDuration);
                return {
                    ...e,
                    startPercent: prevTime / totalDuration,
                    endPercent: currTime / totalDuration,
                };
            });
            console.log(
                activeDuration,
                numInactive,
                totalDuration,
                inactiveSliceDuration
            );
            setSessionIntervals(sliderIntervalMap);
            setEvents(newEvents);
            setReplayer(r);
            setSessionEndTime(r.getMetaData().totalTime);
            setState(ReplayerState.LoadedAndUntouched);
        }
    }, [eventsData]);

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
