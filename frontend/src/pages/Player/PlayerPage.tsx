import React, {
    useState,
    useRef,
    useEffect,
    useContext,
    useMemo,
    useCallback,
} from 'react';
import { useQueryParam, BooleanParam } from 'use-query-params';
import { useParams } from 'react-router-dom';
import { Replayer, EventType } from '@highlight-run/rrweb';
import { eventWithTime } from '@highlight-run/rrweb/dist/types';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Toolbar } from './Toolbar/Toolbar';
import { StreamElement } from './StreamElement/StreamElement';
import { MetadataBox } from './MetadataBox/MetadataBox';
import { HighlightEvent } from './HighlightEvent';
// @ts-ignore
import useResizeAware from 'react-resize-aware';
import styles from './PlayerPage.module.scss';
import 'rc-slider/assets/index.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import ReplayerContext, { ReplayerState } from './ReplayerContext';
import { useMarkSessionAsViewedMutation } from '../../graph/generated/hooks';
import { usePlayer } from './PlayerHook/PlayerHook';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import _ from 'lodash';
import SessionLevelBar from './SessionLevelBar/SessionLevelBar';
import copySessionShareLinkToClipboard from './utils/utils';
import useLocalStorage from '@rehooks/local-storage';
import classNames from 'classnames';
import { Dropdown, Menu, MenuItemProps } from 'antd';
import { NewCommentEntry } from './Toolbar/NewCommentEntry/NewCommentEntry';
import Modal from '../../components/Modal/Modal';
import useMedia from '../../hooks/useMedia/useMedia';
import ShareButton from './ShareButton/ShareButton';
import DOMInteractionsToggle from './DOMInteractionsToggle/DOMInteractionsToggle';

export const Player = () => {
    const { session_id } = useParams<{
        session_id: string;
    }>();
    const [resizeListener, sizes] = useResizeAware();
    const player = usePlayer({
        refId: 'player',
    });
    const {
        state: replayerState,
        scale: replayerScale,
        setScale,
        replayer,
        time,
        pause,
    } = player;
    const playerWrapperRef = useRef<HTMLDivElement>(null);
    const { setOpenSidebar } = useContext(SidebarContext);
    const [markSessionAsViewed] = useMarkSessionAsViewedMutation();
    const [showRightPanelPreference] = useLocalStorage(
        'highlightMenuShowRightPanel',
        true
    );
    const [showAddCommentEntry, setShowAddCommentEntry] = useState(false);
    const hideRightPanel = useMedia<boolean>(
        ['(max-width: 1300px)'],
        [true],
        false
    );
    const shouldShowRightPanel = showRightPanelPreference && !hideRightPanel;

    useEffect(() => {
        if (session_id) {
            markSessionAsViewed({
                variables: { id: session_id, viewed: true },
            });
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
        replayerState !== ReplayerState.Loading && replayerScale !== 1;

    const CONTEXT_MENU_ITEMS: (Pick<MenuItemProps, 'onClick'> & {
        label: string;
    })[] = [
        {
            onClick: () => {
                setShowAddCommentEntry(true);
            },
            label: 'Add a comment',
        },
        {
            onClick: () => {
                copySessionShareLinkToClipboard(time);
            },
            label: 'Copy URL at current time',
        },
    ];

    return (
        <ReplayerContext.Provider value={player}>
            <div
                className={classNames(styles.playerBody, {
                    [styles.noRightPanel]: !shouldShowRightPanel,
                })}
            >
                <div className={styles.playerLeftSection}>
                    <div className={styles.playerLeftTopSection}>
                        <SessionLevelBar />
                        <ShareButton />
                        <DOMInteractionsToggle />
                    </div>
                    <div className={styles.rrwebPlayerSection}>
                        <div
                            className={styles.rrwebPlayerWrapper}
                            ref={playerWrapperRef}
                        >
                            {resizeListener}
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {CONTEXT_MENU_ITEMS.map((item) => (
                                            <Menu.Item
                                                key={item.label}
                                                onClick={item.onClick}
                                            >
                                                {item.label}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                                trigger={['contextMenu']}
                                onVisibleChange={(visible) => {
                                    if (
                                        visible &&
                                        replayerState !== ReplayerState.Paused
                                    ) {
                                        pause();
                                    }
                                }}
                            >
                                <div
                                    style={{
                                        visibility: isReplayerReady
                                            ? 'visible'
                                            : 'hidden',
                                    }}
                                    className={styles.rrwebPlayerDiv}
                                    id="player"
                                />
                            </Dropdown>
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
                        onResize={() => replayer && resizePlayer(replayer)}
                    />
                </div>
                {shouldShowRightPanel && (
                    <div className={styles.playerRightSection}>
                        <MetadataBox />
                        <EventStream />
                    </div>
                )}
                <Modal
                    visible={showAddCommentEntry}
                    onCancel={() => {
                        setShowAddCommentEntry(false);
                    }}
                    destroyOnClose
                    minimal
                    centered
                    width="324px"
                >
                    <NewCommentEntry
                        currentTime={Math.floor(time)}
                        onCloseHandler={() => {
                            setShowAddCommentEntry(false);
                        }}
                    />
                </Modal>
            </div>
        </ReplayerContext.Provider>
    );
};

const EventStream = () => {
    const [debug] = useQueryParam('debug', BooleanParam);
    const { replayer, time, events } = useContext(ReplayerContext);
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
            (currentEventId: string, usefulEventsList: HighlightEvent[]) => {
                if (virtuoso.current) {
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
            },
            1000 / 60
        ),
        []
    );

    useEffect(() => {
        if (!isInteractingWithStreamEvents) {
            scrollFunction(currEvent, usefulEvents);
        }
    }, [
        currEvent,
        scrollFunction,
        usefulEvents,
        isInteractingWithStreamEvents,
    ]);

    return (
        <>
            <div id="wrapper" className={styles.eventStreamContainer}>
                {!events.length ? (
                    <div className={styles.skeletonContainer}>
                        <Skeleton
                            count={4}
                            height={35}
                            style={{
                                marginTop: 8,
                                marginBottom: 8,
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
    if (e.type === EventType.Custom) {
        return !!e.data.tag;
    }
    // If its not an 'incrementalSnapshot', discard.
    if ((e as eventWithTime).type !== EventType.IncrementalSnapshot)
        return false;

    return false;
};
