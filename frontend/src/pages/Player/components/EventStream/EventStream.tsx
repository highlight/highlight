import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import { EventType, eventWithTime } from '@highlight-run/rrweb/dist/types';
import SvgSettingsIcon from '@icons/SettingsIcon';
import { HighlightEvent } from '@pages/Player/HighlightEvent';
import {
    ReplayerState,
    useReplayerContext,
} from '@pages/Player/ReplayerContext';
import { StreamElement } from '@pages/Player/StreamElement/StreamElement';
import _ from 'lodash';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Skeleton from 'react-loading-skeleton';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { BooleanParam, useQueryParam } from 'use-query-params';

import styles from './EventStream.module.scss';

const EventStream = () => {
    const [debug] = useQueryParam('debug', BooleanParam);
    const { replayer, time, events, state } = useReplayerContext();
    const [currEvent, setCurrEvent] = useState('');
    const [
        isInteractingWithStreamEvents,
        setIsInteractingWithStreamEvents,
    ] = useState(false);
    const virtuoso = useRef<VirtuosoHandle>(null);

    useEffect(() => {
        if (!replayer) return;
        replayer.on('event-cast', (e: any) => {
            const event = e as HighlightEvent;
            if (usefulEvent(event) || debug) {
                setCurrEvent(event.identifier);
            }
        });
    }, [replayer, debug]);

    const usefulEvents = useMemo(
        () => (debug ? events : events.filter(usefulEvent)),
        [events, debug]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const scrollFunction = useCallback(
        _.debounce(
            (
                currentEventId: string,
                usefulEventsList: HighlightEvent[],
                state
            ) => {
                if (virtuoso.current) {
                    if (state === ReplayerState.Playing) {
                        const matchingEventIndex = usefulEventsList.findIndex(
                            (event) => event.identifier === currentEventId
                        );

                        if (matchingEventIndex > -1) {
                            virtuoso.current.scrollToIndex({
                                index: matchingEventIndex,
                                align: 'center',
                                behavior: 'smooth',
                            });
                        }
                    }
                }
            },
            1000 / 60
        ),
        []
    );

    useEffect(() => {
        if (!isInteractingWithStreamEvents) {
            scrollFunction(currEvent, usefulEvents, state);
        }
    }, [
        currEvent,
        scrollFunction,
        usefulEvents,
        isInteractingWithStreamEvents,
        state,
    ]);

    return (
        <>
            <div id="wrapper" className={styles.eventStreamContainer}>
                {!events.length ? (
                    <div>
                        <Skeleton
                            count={20}
                            height={43}
                            width="301px"
                            style={{
                                marginTop: 16,
                                marginLeft: 24,
                                marginRight: 24,
                                borderRadius: 8,
                            }}
                        />
                    </div>
                ) : (
                    replayer && (
                        <div>
                            <div>
                                <div>
                                    <Input />
                                </div>
                                <div>
                                    <Button trackingId="SessionEventStreamSettings">
                                        <SvgSettingsIcon />
                                    </Button>
                                </div>
                            </div>
                            <Virtuoso
                                onMouseEnter={() => {
                                    setIsInteractingWithStreamEvents(true);
                                }}
                                onMouseLeave={() => {
                                    setIsInteractingWithStreamEvents(false);
                                }}
                                //     @ts-ignore
                                components={{ List: VirtuosoList }}
                                ref={virtuoso}
                                data={usefulEvents}
                                overscan={500}
                                itemContent={(index, event) => (
                                    <StreamElement
                                        e={event}
                                        key={index}
                                        start={replayer.getMetaData().startTime}
                                        isCurrent={
                                            event.timestamp -
                                                replayer.getMetaData()
                                                    .startTime ===
                                                time ||
                                            event.identifier === currEvent
                                        }
                                        onGoToHandler={setCurrEvent}
                                    />
                                )}
                            />
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default EventStream;

// used in filter() type methods to fetch events we want
const usefulEvent = (e: eventWithTime): boolean => {
    if (e.type === EventType.Custom) {
        return !!e.data.tag;
    }
    // If its not an 'incrementalSnapshot', discard.
    if ((e as eventWithTime).type !== EventType.IncrementalSnapshot)
        return false;

    return false;
};

const VirtuosoList = React.forwardRef((props, ref) => {
    // @ts-ignore
    return <div {...props} ref={ref} className={styles.virtualList} />;
});
