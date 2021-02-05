import { Replayer } from '@highlight-run/rrweb';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DemoContext } from '../../../DemoContext';
import {
    useGetEventsQuery,
    useGetLiveEventsSubscription,
} from '../../../graph/generated/hooks';
import { HighlightEvent } from '../HighlightEvent';

import { ReplayerContextInterface, ReplayerState } from '../ReplayerContext';

export const usePlayer = ({
    refId,
    liveMode,
}: {
    refId: string;
    liveMode: boolean | undefined;
}): ReplayerContextInterface => {
    const { session_id } = useParams<{ session_id: string }>();

    const [scale, setScale] = useState(1);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [state, setState] = useState<ReplayerState>(ReplayerState.NotLoaded);
    const [time, setTime] = useState<number>(0);

    const { demo } = useContext(DemoContext);

    // Get event data; only runs when playing in playback mode.
    const {
        loading: eventsLoading,
        error: eventsError,
        data: eventsData,
    } = useGetEventsQuery({
        variables: {
            session_id: demo
                ? process.env.REACT_APP_DEMO_SESSION ?? ''
                : session_id ?? '',
        },
        context: { headers: { 'Highlight-Demo': demo } },
        skip: liveMode === undefined || liveMode === true,
    });

    // Get live event data; only runs when playing in live mode.
    useGetLiveEventsSubscription({
        variables: { session_id },
        skip: liveMode === undefined || liveMode === false,
        onSubscriptionData: (options) => {
            const newEvents = toHighlightEvents(
                options.subscriptionData.data?.liveEvents ?? []
            );
            if (newEvents?.length) {
                console.log('live events count:', newEvents.length);
                // Initialize the replayer if it doesn't already exist
                if (!replayer) {
                    setState(ReplayerState.Loading);
                    let r = new Replayer(newEvents, {
                        liveMode: true,
                        root: document.getElementById(refId) as HTMLElement,
                    });
                    setReplayer(r);
                    setState(ReplayerState.Loaded);
                    r.startLive();
                } else if (replayer) {
                    for (var e of newEvents) {
                        replayer.addEvent(e);
                    }
                }
                setEvents([...events, ...newEvents]);
            }
        },
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
            setState(ReplayerState.Loaded);
        }
    }, [eventsData]);

    return {
        scale,
        setScale,
        time,
        setTime,
        liveMode: liveMode ?? false,
        replayer,
        state,
        events,
    };
};

const toHighlightEvents = (events: Array<any>): Array<HighlightEvent> => {
    return (
        events.map((e: HighlightEvent, i: number) => {
            return { ...e, identifier: i.toString() };
        }) ?? []
    );
};
