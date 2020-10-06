import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Replayer,
    mirror,
    MouseInteractions,
    IncrementalSource,
    EventType,
} from 'rrweb';

import {
    eventWithTime,
    mouseInteractionData,
    incrementalData,
} from 'rrweb/typings/types';

import { elementNode } from 'rrweb-snapshot';
import { Element, scroller } from 'react-scroll';
import { Spinner } from '../../components/Spinner/Spinner';
import { MillisToMinutesAndSeconds } from '../../util/time';
import { useQuery, gql } from '@apollo/client';
import { ReactComponent as PointerIcon } from '../../static/pointer-up.svg';
import { ReactComponent as HoverIcon } from '../../static/hover.svg';
import { Skeleton } from 'antd';
import { Toolbar } from './Toolbar/Toolbar';
import { MetadataBox } from './MetadataBox/MetadataBox';

import styles from './PlayerPage.module.css';
import 'rc-slider/assets/index.css';

type HighlightEvent = eventWithTime & { identifier: string };

export const Player = () => {
    const { session_id } = useParams();
    const [replayer, setReplayer] = useState<Replayer | undefined>(undefined);
    const [time, setTime] = useState(0);
    const [events, setEvents] = useState<Array<HighlightEvent>>([]);
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
        { variables: { session_id } }
    );

    const resizePlayer = (replayer: Replayer): boolean => {
        const width = replayer?.wrapper?.getBoundingClientRect().width;
        const height = replayer?.wrapper?.getBoundingClientRect().height;
        const targetWidth = playerWrapperRef.current?.clientWidth;
        const targetHeight = playerWrapperRef.current?.clientHeight;
        if (!width || !targetWidth || !height || !targetHeight) {
            return false;
        }
        const widthDelta = width - targetWidth;
        const heightDelta = height - targetHeight;
        const widthScale = (targetWidth - 80) / width;
        const heightScale = (targetHeight - 80) / height;
        const scale = Math.min(heightScale, widthScale);
        const endHeight = (targetHeight - height * scale) / 2;
        const endWidth = (targetWidth - width * scale) / 2;
        console.log('height: ', height, targetHeight, heightScale, heightDelta);
        console.log('width', width, targetWidth, widthScale, widthDelta);
        console.log(`applying scale ${scale}`);
        replayer?.wrapper?.setAttribute(
            'style',
            `
      transform: scale(${scale});
      top: ${endHeight}px;
      left: ${endWidth}px;
      `
        );
        setPlayerLoading(false);
        return true;
    };

    // This adjusts the dimensions (i.e. scale()) of the iframe when the page loads.
    useEffect(() => {
        if (replayer) {
            const i = window.setInterval(() => {
                if (resizePlayer(replayer)) {
                    window.clearInterval(i);
                }
            }, 200);
        }
    }, [replayer]);

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
                        <div
                            style={{
                                visibility: playerLoading
                                    ? 'hidden'
                                    : 'visible',
                            }}
                            className={styles.rrwebPlayerDiv}
                            id="player"
                        ></div>
                        {(playerLoading || sessionLoading) && <Spinner />}
                    </div>
                </div>
                <Toolbar
                    replayer={replayer}
                    onSelect={(newTime: number) => {
                        console.log(newTime);
                        replayer?.pause(newTime);
                        setTime(newTime);
                    }}
                />
            </div>
            <div className={styles.playerRightSection}>
                <EventStream replayer={replayer} events={events} time={time} />{' '}
                <MetadataBox />
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
    const [currEvent, setCurrEvent] = useState(-1);
    useEffect(() => {
        if (!replayer) return;
        replayer.on('event-cast', (e: any) => {
            const event = e as eventWithTime;
            if (usefulEvent(event)) {
                setCurrEvent(event.timestamp);
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
                <div className={styles.emptyScrollDiv}></div>
                {!events.length ? (
                    <Skeleton active />
                ) : (
                    replayer &&
                    events
                        .filter(usefulEvent)
                        .map((e: HighlightEvent, i: number) => {
                            const mouseInteraction = e.data as mouseInteractionData;
                            let eventStr = '';
                            switch (mouseInteraction.type) {
                                case MouseInteractions.Click:
                                    eventStr = 'Click';
                                    break;
                                case MouseInteractions.Focus:
                                    eventStr = 'Focus';
                                    break;
                            }
                            const node = mirror.map[mouseInteraction.id]
                                ?.__sn as elementNode;
                            var idString = node?.tagName;
                            if (node?.attributes) {
                                const attrs = node?.attributes;
                                if (
                                    'class' in attrs &&
                                    attrs.class.toString()
                                ) {
                                    idString = idString.concat(
                                        '.' + attrs.class
                                    );
                                }
                                if ('id' in attrs && attrs.id.toString()) {
                                    idString = idString.concat('#' + attrs.id);
                                }
                                Object.keys(attrs)
                                    .filter(
                                        (key) => !['class', 'id'].includes(key)
                                    )
                                    .forEach(
                                        (key) =>
                                            (idString +=
                                                '[' +
                                                key +
                                                '=' +
                                                attrs[key] +
                                                ']')
                                    );
                            }

                            let timeSinceStart =
                                e?.timestamp -
                                replayer?.getMetaData()?.startTime;
                            return (
                                <Element
                                    name={e.identifier.toString()}
                                    key={e.identifier.toString()}
                                    className={styles.eventWrapper}
                                >
                                    <div
                                        className={styles.streamElement}
                                        style={{
                                            backgroundColor:
                                                currEvent === e.timestamp
                                                    ? '#F2EDFF'
                                                    : 'inherit',
                                            color:
                                                currEvent === e.timestamp
                                                    ? 'black'
                                                    : 'grey',
                                            fill:
                                                currEvent === e.timestamp
                                                    ? 'black'
                                                    : 'grey',
                                        }}
                                        key={i}
                                        id={i.toString()}
                                    >
                                        <div className={styles.iconWrapper}>
                                            {eventStr === 'Click' ? (
                                                <PointerIcon
                                                    className={styles.eventIcon}
                                                />
                                            ) : (
                                                <HoverIcon
                                                    className={styles.eventIcon}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.eventText}>
                                            &nbsp;{eventStr} &nbsp;&nbsp;
                                        </div>
                                        <div
                                            className={styles.codeBlockWrapper}
                                        >
                                            {idString}
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            {MillisToMinutesAndSeconds(
                                                timeSinceStart
                                            )}
                                        </div>
                                    </div>
                                </Element>
                            );
                        })
                )}
            </div>
        </>
    );
};

// used in filter() type methods to fetch events we want
const usefulEvent = (e: eventWithTime): boolean => {
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
