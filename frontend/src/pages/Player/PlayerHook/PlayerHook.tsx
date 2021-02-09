import { Replayer } from '@highlight-run/rrweb';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoContext } from '../../../DemoContext';
import { useGetEventsQuery } from '../../../graph/generated/hooks';
import { HighlightEvent } from '../HighlightEvent';

import {
    ReplayerContextInterface,
    ReplayerState,
    SessionIntervals,
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
    const [sessionIntervals, setSessionIntervals] = useState<
        Array<SessionIntervals>
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
            let r = new Replayer(newEvents, {
                root: document.getElementById('player') as HTMLElement,
            });
            setEvents(newEvents);
            setReplayer(r);
            setState(ReplayerState.LoadedAndUntouched);
            // Preprocess and logic for player length with inactive sessions
            let metadata = r.getMetaData();
            let intervals = r.getActivityIntervals().map((e) => ({
                ...e,
                startTime: e.startTime - metadata.startTime,
                endTime: e.endTime - metadata.startTime,
                duration: e.endTime - e.startTime,
            }));
            setSessionIntervals(intervals);
        }
    }, [eventsData]);

    const play = (newTime?: number) => {
        setState(ReplayerState.Playing);
        setTime(newTime ?? time);
        replayer?.play(newTime);
    };

    const pause = (newTime?: number) => {
        setState(ReplayerState.Paused);
        setTime(newTime ?? time);
        replayer?.pause(newTime);
    };

    return {
        scale,
        setScale,
        time,
        setTime,
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
