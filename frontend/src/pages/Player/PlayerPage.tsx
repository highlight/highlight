import 'rc-slider/assets/index.css';

import { EventType, Replayer } from '@highlight-run/rrweb';
import { eventWithTime } from '@highlight-run/rrweb/dist/types';
import classNames from 'classnames';
import _ from 'lodash';
import Lottie from 'lottie-react';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import useResizeAware from 'react-resize-aware';
import { useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { BooleanParam, useQueryParam } from 'use-query-params';

import { useAuthContext } from '../../AuthContext';
import ButtonLink from '../../components/Button/ButtonLink/ButtonLink';
import ElevatedCard from '../../components/ElevatedCard/ElevatedCard';
import FullBleedCard from '../../components/FullBleedCard/FullBleedCard';
import Modal from '../../components/Modal/Modal';
import { useMarkSessionAsViewedMutation } from '../../graph/generated/hooks';
import WaitingAnimation from '../../lottie/waiting.json';
import { HighlightEvent } from './HighlightEvent';
import PlayerCommentCanvas, {
    Coordinates2D,
} from './PlayerCommentCanvas/PlayerCommentCanvas';
import { usePlayer } from './PlayerHook/PlayerHook';
import usePlayerConfiguration from './PlayerHook/utils/usePlayerConfiguration';
import styles from './PlayerPage.module.scss';
import {
    ReplayerContextProvider,
    ReplayerState,
    useReplayerContext,
} from './ReplayerContext';
import RightPlayerPanel from './RightPlayerPanel/RightPlayerPanel';
import SearchPanel from './SearchPanel/SearchPanel';
import SessionLevelBar from './SessionLevelBar/SessionLevelBar';
import { StreamElement } from './StreamElement/StreamElement';
import { NewCommentEntry } from './Toolbar/NewCommentEntry/NewCommentEntry';
import { Toolbar } from './Toolbar/Toolbar';

const Player = () => {
    const { isLoggedIn } = useAuthContext();
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
    }>();
    const [resizeListener, sizes] = useResizeAware();
    const player = usePlayer();
    const {
        state: replayerState,
        scale: replayerScale,
        setScale,
        replayer,
        time,
        canViewSession,
        isPlayerReady,
    } = player;
    const { setShowLeftPanel } = usePlayerConfiguration();
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const newCommentModalRef = useRef<HTMLDivElement>(null);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();
    const {
        showLeftPanel: showLeftPanelPreference,
        showRightPanel,
    } = usePlayerConfiguration();
    const [commentModalPosition, setCommentModalPosition] = useState<
        Coordinates2D | undefined
    >(undefined);
    const [commentPosition, setCommentPosition] = useState<
        Coordinates2D | undefined
    >(undefined);

    useEffect(() => {
        if (session_id && isLoggedIn) {
            markSessionAsViewed({
                variables: { id: session_id, viewed: true },
            });
        }
    }, [session_id, isLoggedIn, markSessionAsViewed]);

    useEffect(() => {
        if (!session_id) {
            setShowLeftPanel(true);
        }
    }, [session_id, setShowLeftPanel]);

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

        if (scale <= 0) {
            return false;
        }

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

    const showLeftPanel = showLeftPanelPreference && canViewSession;

    return (
        <ReplayerContextProvider value={player}>
            <div
                className={classNames(styles.playerBody, {
                    [styles.withLeftPanel]: showLeftPanel,
                })}
            >
                {showLeftPanel && (
                    <div className={styles.playerLeftPanel}>
                        <SearchPanel />
                    </div>
                )}
                {!canViewSession && (
                    <FullBleedCard
                        title="Session quota reached 😔"
                        animation={<Lottie animationData={WaitingAnimation} />}
                    >
                        <p>
                            This session was recorded after you reached your
                            session quota. To view it, upgrade your plan.
                        </p>
                        <ButtonLink
                            to={`/${organization_id}/billing`}
                            trackingId="PlayerPageUpgradePlan"
                            className={styles.center}
                        >
                            Upgrade Plan
                        </ButtonLink>
                    </FullBleedCard>
                )}
                <div className={styles.playerCenterPanel}>
                    <SessionLevelBar />
                    <div className={styles.playerContainer}>
                        <div className={styles.rrwebPlayerSection}>
                            <div className={styles.playerCenterColumn}>
                                <div
                                    className={styles.rrwebPlayerWrapper}
                                    ref={playerWrapperRef}
                                >
                                    {resizeListener}
                                    {replayerState ===
                                        ReplayerState.SessionRecordingStopped && (
                                        <div
                                            className={
                                                styles.manuallyStoppedMessageContainer
                                            }
                                            style={{
                                                height: replayer?.wrapper.getBoundingClientRect()
                                                    .height,
                                                width: replayer?.wrapper.getBoundingClientRect()
                                                    .width,
                                            }}
                                        >
                                            <ElevatedCard title="Session recording manually stopped">
                                                <p>
                                                    <a
                                                        href="https://docs.highlight.run/reference#stop"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <code>H.stop()</code>
                                                    </a>{' '}
                                                    was called during the
                                                    session. Calling this method
                                                    stops the session recording.
                                                    If you expect the recording
                                                    to continue please check
                                                    where you are calling{' '}
                                                    <a
                                                        href="https://docs.highlight.run/reference#stop"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        <code>H.stop()</code>
                                                    </a>
                                                    .
                                                </p>
                                            </ElevatedCard>
                                        </div>
                                    )}
                                    {isPlayerReady && (
                                        <PlayerCommentCanvas
                                            setModalPosition={
                                                setCommentModalPosition
                                            }
                                            isReplayerReady={isPlayerReady}
                                            modalPosition={commentModalPosition}
                                            setCommentPosition={
                                                setCommentPosition
                                            }
                                        />
                                    )}
                                    <div
                                        style={{
                                            visibility: isPlayerReady
                                                ? 'visible'
                                                : 'hidden',
                                        }}
                                        className={classNames(
                                            styles.rrwebPlayerDiv,
                                            'highlight-block'
                                        )}
                                        id="player"
                                    />
                                    {!isPlayerReady && (
                                        <PlayerSkeleton
                                            showingLeftPanel={showLeftPanel}
                                            showingRightPanel={showRightPanel}
                                            width={
                                                playerWrapperRef.current
                                                    ?.clientWidth
                                            }
                                        />
                                    )}
                                </div>
                                <Toolbar />
                            </div>

                            <RightPlayerPanel />
                        </div>
                    </div>
                </div>
                <Modal
                    visible={commentModalPosition !== undefined}
                    onCancel={() => {
                        setCommentModalPosition(undefined);
                    }}
                    destroyOnClose
                    minimal
                    width="324px"
                    style={{
                        left: `${commentModalPosition?.x}px`,
                        top: `${commentModalPosition?.y}px`,
                        margin: 0,
                    }}
                    mask={false}
                    modalRender={(node) => (
                        <div className={styles.commentModal}>{node}</div>
                    )}
                >
                    <div ref={newCommentModalRef}>
                        <NewCommentEntry
                            currentTime={Math.floor(time)}
                            onCloseHandler={() => {
                                setCommentModalPosition(undefined);
                            }}
                            commentPosition={commentPosition}
                            parentRef={newCommentModalRef}
                        />
                    </div>
                </Modal>
            </div>
        </ReplayerContextProvider>
    );
};

export const EventStream = () => {
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
                                            replayer.getMetaData().startTime ===
                                            time ||
                                        event.identifier === currEvent
                                    }
                                    onGoToHandler={setCurrEvent}
                                />
                            )}
                        />
                    )
                )}
            </div>
        </>
    );
};

const PlayerSkeleton = ({
    width,
    showingLeftPanel,
    showingRightPanel,
}: {
    width: number | undefined;
    showingLeftPanel: boolean;
    showingRightPanel: boolean;
}) => {
    const { showDevTools } = usePlayerConfiguration();
    let adjustedWidth = width ?? 80;

    if (showingLeftPanel) {
        adjustedWidth -= 475;
    }
    if (showingRightPanel) {
        adjustedWidth -= 350;
    }
    adjustedWidth = Math.min(Math.max(300, adjustedWidth), 600);

    return (
        <SkeletonTheme
            color={'var(--text-primary-inverted)'}
            highlightColor={'#f5f5f5'}
        >
            <Skeleton
                height={!showDevTools ? adjustedWidth * 0.8 : '200px'}
                width={adjustedWidth}
                duration={1}
            />
        </SkeletonTheme>
    );
};

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

export default Player;

const VirtuosoList = React.forwardRef((props, ref) => {
    // @ts-ignore
    return <div {...props} ref={ref} className={styles.virtualList} />;
});
