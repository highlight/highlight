import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
    Replayer,
    MouseInteractions,
    IncrementalSource,
    EventType,
} from '@highlight-run/rrweb';
import {
    eventWithTime,
    incrementalData,
} from '@highlight-run/rrweb/typings/types';
import { scroller } from 'react-scroll';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Toolbar } from './Toolbar/Toolbar';
import { StreamElement } from './StreamElement/StreamElement';
import { MetadataBox } from './MetadataBox/MetadataBox';
import { HighlightEvent } from './HighlightEvent';
import { StaticMap, buildStaticMap } from './StaticMap/StaticMap';
// @ts-ignore
import useResizeAware from 'react-resize-aware';
import styles from './PlayerPage.module.scss';
import 'rc-slider/assets/index.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import ReplayerContext, { ReplayerState } from './ReplayerContext';
import { useMarkSessionAsViewedMutation } from '../../graph/generated/hooks';
import { usePlayer } from './PlayerHook/PlayerHook';

export const Player = () => {
    var { session_id } = useParams<{ session_id: string }>();
    const [resizeListener, sizes] = useResizeAware();
    const player = usePlayer({
        refId: 'player',
    });
    const {
        state: replayerState,
        scale: replayerScale,
        setScale,
        replayer,
        setTime,
    } = player;
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const { setOpenSidebar } = useContext(SidebarContext);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();

    useEffect(() => {
        if (session_id) {
            markSessionAsViewed({ variables: { id: session_id } });
        }
    }, [session_id, markSessionAsViewed]);

    useEffect(() => {
        setOpenSidebar(false);
    }, [setOpenSidebar]);

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

        // why translate -50 -50 -> https://medium.com/front-end-weekly/absolute-centering-in-css-ea3a9d0ad72e
        replayer?.wrapper?.setAttribute(
            'style',
            `transform: scale(${replayerScale * scale}) translate(-50%, -50%)`
        );

        setScale((s) => {
            return s * scale;
        });
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

    const isReplayerReady =
        replayerState === ReplayerState.Loaded && replayerScale !== 1;

    return (
        <ReplayerContext.Provider value={player}>
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
                                    visibility: isReplayerReady
                                        ? 'visible'
                                        : 'hidden',
                                }}
                                className={styles.rrwebPlayerDiv}
                                id="player"
                            />
                            {!isReplayerReady ? (
                                <PlayerSkeleton
                                    height={
                                        playerWrapperRef.current?.clientHeight
                                    }
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                    <Toolbar
                        onSelect={(newTime: number) => {
                            replayer?.pause(newTime);
                            setTime(newTime);
                        }}
                        onResize={() => replayer && resizePlayer(replayer)}
                    />
                </div>
                <div className={styles.playerRightSection}>
                    <MetadataBox />
                    <EventStream />
                </div>
            </div>
        </ReplayerContext.Provider>
    );
};

const EventStream = () => {
    const { replayer, time, events } = useContext(ReplayerContext);
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
                    <Skeleton
                        count={4}
                        height={35}
                        style={{ marginTop: 8, marginBottom: 8 }}
                    />
                ) : (
                    replayer &&
                    events
                        .filter(usefulEvent)
                        .map((e: HighlightEvent, i: number) => (
                            <StreamElement
                                e={e}
                                key={i}
                                start={replayer.getMetaData().startTime}
                                isCurrent={
                                    e.timestamp -
                                        replayer.getMetaData().startTime ===
                                        time || e.identifier === currEvent
                                }
                                onGoToHandler={setCurrEvent}
                                nodeMap={staticMap}
                            />
                        ))
                )}
            </div>
        </>
    );
};

const PlayerSkeleton = ({ height }: { height: number | undefined }) => {
    const adjusted = (height ?? 80) - 80;
    return (
        <SkeletonTheme color={'white'} highlightColor={'#f5f5f5'}>
            <Skeleton height={adjusted} width={adjusted} duration={1} />
        </SkeletonTheme>
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
