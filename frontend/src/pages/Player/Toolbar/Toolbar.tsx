import {
    AutoPlayToolbarItem,
    DevToolsToolbarItem,
    MouseTrailToolbarItem,
    PlaybackSpeedControlToolbarItem,
    SkipInactiveToolbarItem,
    TimelineAnnotationsToolbarItem,
} from '@pages/Player/Toolbar/ToolbarItems/ToolbarItems';
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems';
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import ToolbarMenu from '@pages/Player/Toolbar/ToolbarMenu/ToolbarMenu';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import Skeleton from 'react-loading-skeleton';
import { useHistory } from 'react-router-dom';

import { useAuthContext } from '../../../authentication/AuthContext';
import Button from '../../../components/Button/Button/Button';
import Modal from '../../../components/Modal/Modal';
import { ErrorObject } from '../../../graph/generated/schemas';
import SvgFullscreenIcon from '../../../static/FullscreenIcon';
import SvgMinimize2Icon from '../../../static/Minimize2Icon';
import SvgPauseIcon from '../../../static/PauseIcon';
import SvgPlayIcon from '../../../static/PlayIcon';
import SvgSkipBackIcon from '../../../static/SkipBackIcon';
import SvgSkipForwardIcon from '../../../static/SkipForwardIcon';
import {
    MillisToMinutesAndSeconds,
    MillisToMinutesAndSecondsVerbose,
} from '../../../util/time';
import { usePlayerUIContext } from '../context/PlayerUIContext';
import {
    changeSession,
    EventsForTimeline,
    EventsForTimelineKeys,
    findNextSessionInList,
    findPreviousSessionInList,
} from '../PlayerHook/utils';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour';
import {
    ParsedSessionInterval,
    ReplayerPausedStates,
    ReplayerState,
    useReplayerContext,
} from '../ReplayerContext';
import { usePlayerKeyboardShortcuts } from '../utils/PlayerHooks';
import { DevToolsContextProvider } from './DevToolsContext/DevToolsContext';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import ErrorModal from './DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import { ErrorModalContextProvider } from './ErrorModalContext/ErrorModalContext';
import TimelineIndicators from './TimelineIndicators/TimelineIndicators';
import styles from './Toolbar.module.scss';

export const Toolbar = () => {
    const {
        replayer,
        setTime,
        time,
        state,
        play,
        pause,
        sessionIntervals,
        canViewSession,
        isPlayerReady,
        sessionResults,
    } = useReplayerContext();
    usePlayerKeyboardShortcuts();
    const {
        playerSpeed,
        skipInactive,
        showLeftPanel,
        showDevTools,
        setShowDevTools,
        autoPlayVideo,
        autoPlaySessions,
        setAutoPlayVideo,
        enableInspectElement,
    } = usePlayerConfiguration();
    const history = useHistory();
    const toolbarItems = useToolbarItems();
    const { isLoggedIn } = useAuthContext();
    const { session_id, organization_id } = useParams<{
        session_id: string;
        organization_id: string;
    }>();
    const { setIsPlayerFullscreen, isPlayerFullscreen } = usePlayerUIContext();
    const max = replayer?.getMetaData().totalTime ?? 0;
    const sliderWrapperRef = useRef<HTMLButtonElement>(null);
    const [selectedError, setSelectedError] = useState<ErrorObject | undefined>(
        undefined
    );
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [sliderClientX, setSliderClientX] = useState<number>(-1);

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);
    const isPaused = ReplayerPausedStates.includes(state);

    useEffect(() => {
        if (replayer) {
            if (enableInspectElement) {
                replayer.enableInteract();
            } else {
                replayer.disableInteract();
            }
        }
    }, [enableInspectElement, replayer]);

    useEffect(() => {
        replayer?.setConfig({ skipInactive, speed: playerSpeed });
    }, [replayer, skipInactive, playerSpeed]);

    // Automatically start the player if the user has set the preference.
    useEffect(() => {
        if (isLoggedIn) {
            if (
                (autoPlayVideo || autoPlaySessions) &&
                replayer &&
                isPlayerReady
            ) {
                if (state === ReplayerState.LoadedAndUntouched) {
                    play(time);
                } else if (state === ReplayerState.LoadedWithDeepLink) {
                    pause(time);
                }
            }
        }
    }, [
        isLoggedIn,
        autoPlayVideo,
        autoPlaySessions,
        isPlayerReady,
        pause,
        play,
        replayer,
        setAutoPlayVideo,
        state,
        time,
    ]);

    const endLogger = (e: any) => {
        let newTime = (e.x / wrapperWidth) * max;
        newTime = Math.max(0, newTime);
        newTime = Math.min(max, newTime);

        setLastCanvasPreview(e.x);

        if (isPaused) {
            pause(newTime);
        } else {
            play(newTime);
        }
    };

    const startDraggable = (e: any, data: any) => {
        setLastCanvasPreview(data.x);
        if (!isPaused) {
            pause();
        }
    };

    const onDraggable = (e: any, data: any) => {
        const sliderPercent = data.x / wrapperWidth;
        const newTime = getSliderTime(sliderPercent);
        setTime(newTime);

        // TODO: Add Math.abs to enable both forward and backward scrolling
        // Only forward is supported due as going backwards creates a time heavy operation
        if (data.x - lastCanvasPreview > 10) {
            setLastCanvasPreview(data.x);
        }
    };

    const getSliderPercent = (time: number) => {
        let sliderPercent = 0;
        for (const interval of sessionIntervals) {
            if (time < interval.endTime && time >= interval.startTime) {
                const segmentPercent =
                    (time - interval.startTime) /
                    (interval.endTime - interval.startTime);
                sliderPercent =
                    segmentPercent *
                        (interval.endPercent - interval.startPercent) +
                    interval.startPercent;
                return sliderPercent;
            }
        }
        return sliderPercent;
    };

    const getSliderTime = (sliderPercent: number) => {
        let newTime = 0;
        for (const interval of sessionIntervals) {
            if (
                sliderPercent < interval.endPercent &&
                sliderPercent >= interval.startPercent
            ) {
                if (!interval.active) {
                    return interval.endTime;
                }
                const segmentPercent =
                    (sliderPercent - interval.startPercent) /
                    (interval.endPercent - interval.startPercent);
                newTime =
                    segmentPercent * interval.duration + interval.startTime;
                return newTime;
            }
        }
        return newTime;
    };

    const disableControls = state === ReplayerState.Loading || !canViewSession;
    // The play button should be disabled if the player has reached the end.
    const disablePlayButton = time >= (replayer?.getMetaData().totalTime ?? 0);
    const leftSidebarWidth = showLeftPanel ? 475 : 0;
    /** 64 (sidebar width) + 12 (left padding for the toolbar)  */
    const staticSidebarWidth = isLoggedIn ? 64 + 12 : 12;

    return (
        <ToolbarItemsContextProvider value={toolbarItems}>
            <ErrorModalContextProvider
                value={{ selectedError, setSelectedError }}
            >
                <DevToolsContextProvider
                    value={{
                        openDevTools: showDevTools,
                        setOpenDevTools: setShowDevTools,
                    }}
                >
                    {!isPlayerFullscreen && <TimelineIndicators />}
                    <div id={PlayerPageProductTourSelectors.DevToolsPanel}>
                        <DevToolsWindow
                            time={
                                (replayer?.getMetaData().startTime ?? 0) + time
                            }
                            startTime={replayer?.getMetaData().startTime ?? 0}
                        />
                    </div>
                </DevToolsContextProvider>
                <Modal
                    visible={!!selectedError}
                    onCancel={() => {
                        setSelectedError(undefined);
                    }}
                    width={'fit-content'}
                >
                    <ErrorModal error={selectedError!} />
                </Modal>
                <div className={styles.playerRail}>
                    <div
                        className={styles.sliderRail}
                        style={{
                            position: 'absolute',
                            display: 'flex',
                            background:
                                sessionIntervals.length > 0
                                    ? 'none'
                                    : '#e4e8eb',
                        }}
                    >
                        {sessionIntervals.map((e, ind) => (
                            <SessionSegment
                                key={ind}
                                interval={e}
                                sliderClientX={sliderClientX}
                                wrapperWidth={wrapperWidth}
                                getSliderTime={getSliderTime}
                            />
                        ))}
                    </div>
                    <button
                        disabled={disableControls}
                        className={styles.sliderWrapper}
                        ref={sliderWrapperRef}
                        onMouseMove={(e: React.MouseEvent<HTMLButtonElement>) =>
                            setSliderClientX(
                                e.clientX -
                                    staticSidebarWidth -
                                    leftSidebarWidth
                            )
                        }
                        onMouseLeave={() => setSliderClientX(-1)}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            const ratio =
                                (e.clientX -
                                    staticSidebarWidth -
                                    leftSidebarWidth) /
                                wrapperWidth;
                            setTime(getSliderTime(ratio));
                        }}
                    >
                        <div className={styles.sliderRail}></div>

                        <Draggable
                            axis="x"
                            bounds="parent"
                            onStop={endLogger}
                            onDrag={onDraggable}
                            onStart={startDraggable}
                            disabled={disableControls}
                            position={{
                                x: Math.max(
                                    getSliderPercent(time) * wrapperWidth - 10,
                                    0
                                ),
                                y: 0,
                            }}
                        >
                            <div className={styles.indicatorParent}>
                                <div className={styles.indicator} />
                            </div>
                        </Draggable>
                    </button>
                </div>
                <div className={styles.toolbarSection}>
                    <div className={styles.toolbarLeftSection}>
                        <button
                            className={classNames(
                                styles.undoSection,
                                styles.button
                            )}
                            onClick={() => {
                                H.track('PlayerSkipToPreviousSession');
                                const nextSession = findPreviousSessionInList(
                                    sessionResults.sessions,
                                    session_id
                                );
                                changeSession(
                                    organization_id,
                                    history,
                                    nextSession,
                                    'Playing the previous session.'
                                );
                            }}
                        >
                            <SvgSkipBackIcon
                                fill="inherit"
                                className={classNames(
                                    styles.skipButtonStyle,
                                    styles.icon
                                )}
                            />
                        </button>

                        <button
                            className={classNames(
                                styles.playSection,
                                styles.button
                            )}
                            disabled={disableControls || disablePlayButton}
                            onClick={() => {
                                H.track('Player Play/Pause Button');
                                if (isPaused) {
                                    play(time);
                                } else {
                                    pause(time);
                                }
                            }}
                        >
                            {isPaused ? (
                                <SvgPlayIcon
                                    fill="inherit"
                                    className={classNames(
                                        styles.playButtonStyle,
                                        styles.icon
                                    )}
                                />
                            ) : (
                                <SvgPauseIcon
                                    fill="inherit"
                                    className={classNames(
                                        styles.playButtonStyle,
                                        styles.icon
                                    )}
                                />
                            )}
                        </button>

                        <button
                            className={classNames(
                                styles.redoSection,
                                styles.button
                            )}
                            onClick={() => {
                                H.track('PlayerSkipToNextSession');

                                const nextSession = findNextSessionInList(
                                    sessionResults.sessions,
                                    session_id
                                );
                                changeSession(
                                    organization_id,
                                    history,
                                    nextSession
                                );
                            }}
                        >
                            <SvgSkipForwardIcon
                                fill="inherit"
                                className={classNames(
                                    styles.skipButtonStyle,
                                    styles.icon
                                )}
                            />
                        </button>

                        <div className={styles.timeSection}>
                            {disableControls ? (
                                <Skeleton count={1} width="100px" />
                            ) : (
                                <>
                                    {MillisToMinutesAndSeconds(
                                        //     Sometimes the replayer will report a higher time when the player has ended.
                                        time >= max ? max : time
                                    )}
                                    &nbsp;/&nbsp;
                                    {MillisToMinutesAndSeconds(max)}
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.toolbarRightSection}>
                        {!isPlayerFullscreen && (
                            <>
                                <PlaybackSpeedControlToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <TimelineAnnotationsToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <SkipInactiveToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <AutoPlayToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <MouseTrailToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <DevToolsToolbarItem
                                    loading={disableControls}
                                    renderContext="toolbar"
                                />
                                <ToolbarMenu loading={disableControls} />
                            </>
                        )}
                        <Button
                            trackingId="PlayerFullScreenButton"
                            className={styles.settingsButton}
                            onClick={() => {
                                setIsPlayerFullscreen(
                                    (previousValue) => !previousValue
                                );
                            }}
                        >
                            {isPlayerFullscreen ? (
                                <SvgMinimize2Icon
                                    className={styles.devToolsIcon}
                                />
                            ) : (
                                <SvgFullscreenIcon
                                    className={styles.devToolsIcon}
                                />
                            )}
                        </Button>
                    </div>
                </div>
            </ErrorModalContextProvider>
        </ToolbarItemsContextProvider>
    );
};

const SessionSegment = ({
    interval,
    sliderClientX,
    wrapperWidth,
    getSliderTime,
}: {
    interval: ParsedSessionInterval;
    sliderClientX: number;
    wrapperWidth: number;
    getSliderTime: (sliderTime: number) => number;
}) => {
    const { time } = useReplayerContext();
    const playedColor = interval.active
        ? 'var(--color-purple)'
        : 'var(--color-gray-500)';
    const unplayedColor = interval.active
        ? 'var(--color-purple-200)'
        : 'var(--color-gray-400)';
    const currentRawPercent =
        (time - interval.startTime) / (interval.endTime - interval.startTime);
    const isPercentInInterval = (
        sliderPercent: number,
        interval: ParsedSessionInterval
    ) =>
        sliderPercent >= interval.startPercent &&
        sliderPercent < interval.endPercent;

    return (
        <div
            className={styles.sliderSegment}
            style={{
                width: `${
                    (interval.endPercent - interval.startPercent) * 100
                }%`,
            }}
        >
            <div
                className={styles.sliderPopover}
                style={{
                    left: `${Math.min(
                        Math.max(sliderClientX - 40, 0),
                        wrapperWidth - 80
                    )}px`,
                    display: isPercentInInterval(
                        sliderClientX / wrapperWidth,
                        interval
                    )
                        ? 'block'
                        : 'none',
                }}
            >
                <div>{interval.active ? 'Active' : 'Inactive'}</div>
                <div className={styles.sliderPopoverTime}>
                    {interval.active
                        ? MillisToMinutesAndSeconds(
                              getSliderTime(sliderClientX / wrapperWidth)
                          )
                        : MillisToMinutesAndSecondsVerbose(interval.duration)}
                </div>
            </div>
            <div
                className={classNames(
                    styles.sliderRail,
                    isPercentInInterval(sliderClientX / wrapperWidth, interval)
                        ? styles.segmentHover
                        : ''
                )}
                style={{
                    backgroundColor: unplayedColor,
                }}
            >
                <div
                    style={{
                        backgroundColor: playedColor,
                        height: '100%',
                        width: `${
                            Math.min(Math.max(currentRawPercent, 0), 1) * 100
                        }%`,
                    }}
                ></div>
            </div>
        </div>
    );
};

export const TimelineAnnotationColors: {
    [key in EventsForTimelineKeys[number]]: string;
} = {
    Click: '--color-purple-light',
    Focus: '--color-blue-400',
    Reload: '--color-green-light',
    Navigate: '--color-yellow',
    Errors: '--color-red',
    Segment: '--color-orange-400',
    Track: '--color-blue-300',
    Comments: '--color-green-dark',
    Identify: '--color-orange-500',
    Viewport: '--color-purple-light',
};

export function getAnnotationColor(
    eventTypeKey: typeof EventsForTimeline[number]
) {
    return TimelineAnnotationColors[eventTypeKey];
}
