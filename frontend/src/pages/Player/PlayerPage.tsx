import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Replayer,
    MouseInteractions,
    IncrementalSource,
    EventType,
} from 'rrweb';
import { eventWithTime, incrementalData } from 'rrweb/typings/types';
import { scroller } from 'react-scroll';
import { Spinner } from '../../components/Spinner/Spinner';
import { useQuery, gql } from '@apollo/client';
import { Skeleton } from 'antd';
import { Toolbar } from './Toolbar/Toolbar';
import { StreamElement } from './StreamElement/StreamElement';
import { MetadataBox } from './MetadataBox/MetadataBox';
import { HighlightEvent } from './HighlightEvent';
import { StaticMap, buildStaticMap } from './StaticMap/StaticMap';
// @ts-ignore
import useResizeAware from 'react-resize-aware';
import styles from './PlayerPage.module.scss';
import 'rc-slider/assets/index.css';
import { DemoContext } from '../../DemoContext';

export const Player = () => {
    var { session_id } = useParams();
    const { demo } = useContext(DemoContext);
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [time, setTime] = useState(0);
    const [resizeListener, sizes] = useResizeAware();
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
    const [replayerScale, setReplayerScale] = useState(1);
    const [playerLoading, setPlayerLoading] = useState(true);
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const {
        loading: sessionLoading,
        error: sessionError,
        data: sessionData,
    } = useQuery<{ events: any[] }, { session_id: string }>(
        gql`
            query GetEvents($session_id: ID!) {
                events(session_id: $session_id)
            }
        `,
        {
            variables: {
                session_id: demo
                    ? process.env.REACT_APP_DEMO_SESSION
                    : session_id,
            },
            context: { headers: { 'Highlight-Demo': demo } },
        }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const resizePlayer = (replayer: Replayer): boolean => {
        const width = replayer?.wrapper?.getBoundingClientRect().width;
        const height = replayer?.wrapper?.getBoundingClientRect().height;
        const targetWidth = playerWrapperRef.current?.clientWidth;
        const targetHeight = playerWrapperRef.current?.clientHeight;
        if (!width || !targetWidth || !height || !targetHeight) {
            return false;
        }
        const widthScale = (targetWidth - 80) / width;
        const heightScale = (targetHeight - 80) / height;
        const scale = Math.min(heightScale, widthScale);
        const endHeight = (targetHeight - height * scale) / 2;
        const endWidth = (targetWidth - width * scale) / 2;
        replayer?.wrapper?.setAttribute(
            'style',
            `
      transform: scale(${replayerScale * scale});
      top: ${endHeight}px;
      left: ${endWidth}px;
      `
        );
        setReplayerScale((s) => {
            return s * scale;
        });
        setPlayerLoading(false);
        return true;
    };

    // This adjusts the dimensions (i.e. scale()) of the iframe when the page loads.
    useEffect(() => {
        const i = window.setInterval(() => {
            if (replayer && resizePlayer(replayer)) {
                clearInterval(i);
            }
        }, 200);
        return () => {
            i && clearInterval(i);
        };
    }, [resizePlayer, replayer]);

    // On any change to replayer, 'sizes', or 'showConsole', refresh the size of the player.
    useEffect(() => {
        replayer && resizePlayer(replayer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sizes, replayer]);

    useEffect(() => {
        if (sessionData?.events?.length ?? 0 > 1) {
            // Add an id field to each event so it can be referenced.
            const newEvents: HighlightEvent[] =
                sessionData?.events.map((e: HighlightEvent, i: number) => {
                    return { ...e, identifier: i.toString() };
                }) ?? [];
            let r = new Replayer(newEvents, {
                root: document.getElementById('player') as HTMLElement,
            });
            setEvents(newEvents);
            setReplayer(r);
            r.getTimeOffset();
        }
    }, [sessionData]);

    if (sessionError) {
        return <p>{sessionError.toString()}</p>;
    }

    return (
        <div className={styles.playerBody}>
            <div className={styles.playerLeftSection}>
                <div className={styles.rrwebPlayerSection}>
                    <div
                        className={styles.rrwebPlayerWrapper}
                        ref={playerWrapperRef}
                    >
                        {resizeListener}
                        <div
                            style={{
                                visibility: playerLoading
                                    ? 'hidden'
                                    : 'visible',
                            }}
                            className={styles.rrwebPlayerDiv}
                            id="player"
                        />
                        {(playerLoading || sessionLoading) && <Spinner />}
                    </div>
                </div>
                <Toolbar
                    replayer={replayer}
                    onSelect={(newTime: number) => {
                        replayer?.pause(newTime);
                        setTime(newTime);
                    }}
                    onResize={() => replayer && resizePlayer(replayer)}
                />
            </div>
            <div className={styles.playerRightSection}>
                <MetadataBox />
                <EventStream
                    replayer={replayer}
                    events={events}
                    time={time}
                />{' '}
            </div>
        </div>
    );
};

const EventStream = ({
    events,
    time,
    replayer,
}: {
    events: HighlightEvent[];
    time: number;
    replayer: Replayer | undefined;
}) => {
    const [currEvent, setCurrEvent] = useState('');
    const [loadingMap, setLoadingMap] = useState(true);
    const [staticMap, setStaticMap] = useState<StaticMap | undefined>(
        undefined
    );

    useEffect(() => {
        if (events.length) {
            setStaticMap(buildStaticMap(events as eventWithTime[]));
        }
    }, [events]);

    useEffect(() => {
        if (staticMap !== undefined) {
            setLoadingMap(false);
        }
    }, [staticMap]);

    useEffect(() => {
        if (!replayer) return;
        replayer.on('event-cast', (e: any) => {
            const event = e as HighlightEvent;
            if (usefulEvent(event)) {
                setCurrEvent(event.identifier);
                scroller.scrollTo(
                    (event as HighlightEvent).identifier.toString(),
                    {
                        smooth: true,
                        containerId: 'wrapper',
                        spy: true,
                        offset: -150,
                    }
                );
            }
        });
    }, [replayer, time]);
    return (
        <>
            <div id="wrapper" className={styles.eventStreamContainer}>
                {loadingMap || !events.length || !staticMap ? (
                    <Skeleton active />
                ) : (
                        replayer &&
                        events
                            .filter(usefulEvent)
                            .map((e: HighlightEvent, i: number) => (
                                <StreamElement
                                    e={e}
                                    key={i}
                                    start={replayer.getMetaData().startTime}
                                    isCurrent={e.identifier === currEvent}
                                    nodeMap={staticMap}
                                />
                            ))
                    )}
            </div>
        </>
    );
};

// used in filter() type methods to fetch events we want
const usefulEvent = (e: eventWithTime): boolean => {
    if (e.type === EventType.Custom) return true;
    // If its not an 'incrementalSnapshot', discard.
    if ((e as eventWithTime).type !== EventType.IncrementalSnapshot)
        return false;
    const snapshotEventData = e.data as incrementalData;
    switch (snapshotEventData.source) {
        case IncrementalSource.MouseInteraction:
            switch (snapshotEventData.type) {
                case MouseInteractions.Click:
                    return true;
                case MouseInteractions.Focus:
                    return true;
            }
    }
    return false;
};
