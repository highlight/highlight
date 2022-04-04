import Switch from '@components/Switch/Switch';
import ActivityIcon from '@icons/ActivityIcon';
import SessionToken from '@pages/Player/SessionLevelBar/SessionToken/SessionToken';
import {
    AutoPlayToolbarItem,
    DevToolsToolbarItem,
    MouseTrailToolbarItem,
    PlaybackSpeedControlToolbarItem,
    PlayerTimeToolbarItem,
    SkipInactiveToolbarItem,
    TimelineAnnotationsToolbarItem,
} from '@pages/Player/Toolbar/ToolbarItems/ToolbarItems';
import useToolbarItems from '@pages/Player/Toolbar/ToolbarItems/useToolbarItems';
import { ToolbarItemsContextProvider } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import ToolbarMenu from '@pages/Player/Toolbar/ToolbarMenu/ToolbarMenu';
import { playerTimeToSessionAbsoluteTime } from '@util/session/utils';
import { timerStart } from '@util/timer/timer';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import Skeleton from 'react-loading-skeleton';

import { useAuthContext } from '../../../authentication/AuthContext';
import Button from '../../../components/Button/Button/Button';
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
import { EventsForTimeline, EventsForTimelineKeys } from '../PlayerHook/utils';
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
import TimelineIndicators from './TimelineIndicators/TimelineIndicators';
import styles from './Toolbar.module.scss';

export const Toolbar = React.memo(() => {
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
        isLiveMode,
        setIsLiveMode,
        lastActiveString,
        session,
        sessionStartDateTime,
        sessionMetadata,
    } = useReplayerContext();
    usePlayerKeyboardShortcuts();
    const {
        playerSpeed,
        skipInactive,
        showLeftPanel,
        showDevTools,
        setShowDevTools,
        selectedDevToolsTab,
        setSelectedDevToolsTab,
        autoPlayVideo,
        autoPlaySessions,
        setAutoPlayVideo,
        enableInspectElement,
        showPlayerAbsoluteTime,
    } = usePlayerConfiguration();
    const toolbarItems = useToolbarItems();
    const { isLoggedIn } = useAuthContext();
    const { setIsPlayerFullscreen, isPlayerFullscreen } = usePlayerUIContext();
    const max = sessionMetadata.totalTime ?? 0;
    const sliderWrapperRef = useRef<HTMLButtonElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [sliderClientX, setSliderClientX] = useState<number>(-1);
    const disableControls = state === ReplayerState.Loading || !canViewSession;
    const draggableRef = React.useRef(null);

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
        if (!isLiveMode) {
            replayer?.setConfig({ skipInactive, speed: playerSpeed });
        } else {
            replayer?.setConfig({ skipInactive: false, speed: 1 });
        }
    }, [replayer, skipInactive, playerSpeed, isLiveMode]);

    // Automatically start the player if the user has set the preference.
    useEffect(() => {
        if (isLoggedIn) {
            if (
                (autoPlayVideo || autoPlaySessions || isLiveMode) &&
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
        isLiveMode,
    ]);

    const endLogger = useCallback(
        (e: any) => {
            let newTime = (e.x / wrapperWidth) * max;
            newTime = Math.max(0, newTime);
            newTime = Math.min(max, newTime);

            setLastCanvasPreview(e.x);

            if (isPaused) {
                pause(newTime);
            } else {
                play(newTime);
            }
        },
        [isPaused, max, pause, play, wrapperWidth]
    );

    const startDraggable = useCallback(
        (e: any, data: any) => {
            setLastCanvasPreview(data.x);
            if (!isPaused) {
                pause();
            }
        },
        [isPaused, pause]
    );

    const getSliderTime = useCallback(
        (sliderPercent: number) => {
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
        },
        [sessionIntervals]
    );

    const onDraggable = useCallback(
        (e: any, data: any) => {
            const sliderPercent = data.x / wrapperWidth;
            const newTime = getSliderTime(sliderPercent);
            setTime(newTime);

            // TODO: Add Math.abs to enable both forward and backward scrolling
            // Only forward is supported due as going backwards creates a time heavy operation
            if (data.x - lastCanvasPreview > 10) {
                setLastCanvasPreview(data.x);
            }
        },
        [getSliderTime, lastCanvasPreview, setTime, wrapperWidth]
    );

    const getSliderPercent = useCallback(
        (time: number) => {
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
        },
        [sessionIntervals]
    );

    // The play button should be disabled if the player has reached the end.
    const disablePlayButton =
        time >= (sessionMetadata.totalTime ?? 0) && !isLiveMode;
    const leftSidebarWidth = isPlayerFullscreen ? 0 : showLeftPanel ? 475 : 0;
    /** 64 (sidebar width) + 12 (left padding for the toolbar)  */
    const staticSidebarWidth = isPlayerFullscreen
        ? 16
        : isLoggedIn
        ? 64 + 12
        : 12;

    return (
        <ToolbarItemsContextProvider value={toolbarItems}>
            <DevToolsContextProvider
                value={{
                    openDevTools: showDevTools,
                    setOpenDevTools: setShowDevTools,
                    devToolsTab: selectedDevToolsTab,
                    setDevToolsTab: setSelectedDevToolsTab,
                }}
            >
                <TimelineIndicators />
                {!isLiveMode ? (
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
                                    isLastSegment={
                                        ind === sessionIntervals.length - 1
                                    }
                                />
                            ))}
                        </div>
                        <button
                            disabled={disableControls}
                            className={styles.sliderWrapper}
                            ref={sliderWrapperRef}
                            onMouseMove={(
                                e: React.MouseEvent<HTMLButtonElement>
                            ) =>
                                setSliderClientX(
                                    e.clientX -
                                        staticSidebarWidth -
                                        leftSidebarWidth
                                )
                            }
                            onMouseLeave={() => setSliderClientX(-1)}
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>
                            ) => {
                                const ratio =
                                    (e.clientX -
                                        staticSidebarWidth -
                                        leftSidebarWidth) /
                                    wrapperWidth;
                                timerStart('timelineChangeTime');
                                setTime(getSliderTime(ratio));
                            }}
                        >
                            <div className={styles.sliderRail}></div>

                            <Draggable
                                nodeRef={draggableRef}
                                axis="x"
                                bounds="parent"
                                onStop={endLogger}
                                onDrag={onDraggable}
                                onStart={startDraggable}
                                disabled={disableControls}
                                position={{
                                    x: Math.max(
                                        getSliderPercent(time) * wrapperWidth -
                                            10,
                                        0
                                    ),
                                    y: 0,
                                }}
                            >
                                <div
                                    className={styles.indicatorParent}
                                    ref={draggableRef}
                                >
                                    <div className={styles.indicator} />
                                </div>
                            </Draggable>
                        </button>
                    </div>
                ) : (
                    <div className={styles.playerRail}>
                        <div className={styles.livePlayerRail} />
                    </div>
                )}
                {!isLiveMode && (
                    <div id={PlayerPageProductTourSelectors.DevToolsPanel}>
                        <DevToolsWindow
                            time={(sessionMetadata.startTime ?? 0) + time}
                            startTime={sessionMetadata.startTime ?? 0}
                        />
                    </div>
                )}
            </DevToolsContextProvider>
            <div
                className={classNames(styles.toolbarSection, {
                    [styles.devToolsOpen]: showDevTools,
                })}
            >
                <div className={styles.toolbarLeftSection}>
                    <button
                        className={classNames(
                            styles.undoSection,
                            styles.button
                        )}
                        onClick={() => {
                            H.track('PlayerSkipToPreviousSession');
                            const prevTime = Math.max(time - 5000, 0);
                            setTime(prevTime);
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
                        {isPaused && !isLiveMode ? (
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

                            const nextTime = Math.min(time + 5000, max);
                            setTime(nextTime);
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

                    {session?.processed === false && !disableControls && (
                        <Button
                            trackingId="LiveModeButton"
                            className={styles.liveButton}
                        >
                            <Switch
                                checked={isLiveMode}
                                onChange={(checked: boolean) => {
                                    setIsLiveMode(checked);
                                }}
                                label="Live Mode"
                                trackingId="LiveModeSwitch"
                                red={true}
                            />
                        </Button>
                    )}

                    {isLiveMode && lastActiveString && (
                        <div className={styles.liveUserStatus}>
                            <SessionToken
                                icon={<ActivityIcon />}
                                tooltipTitle="This session is live, but the user is idle."
                            >
                                User was last active {lastActiveString}
                            </SessionToken>
                        </div>
                    )}

                    {!isLiveMode && (
                        <div className={styles.timeSection}>
                            {disableControls ? (
                                <Skeleton count={1} width="60.13px" />
                            ) : showPlayerAbsoluteTime ? (
                                <>
                                    {playerTimeToSessionAbsoluteTime({
                                        sessionStartTime: sessionStartDateTime,
                                        relativeTime: time,
                                    })}
                                    &nbsp;/&nbsp;
                                    {playerTimeToSessionAbsoluteTime({
                                        sessionStartTime: sessionStartDateTime,
                                        relativeTime: max,
                                    })}
                                </>
                            ) : (
                                <>
                                    {MillisToMinutesAndSeconds(
                                        //     Sometimes the replayer will report a higher time when the player has ended.
                                        Math.min(Math.max(time, 0), max)
                                    )}
                                    <>
                                        &nbsp;/&nbsp;
                                        {MillisToMinutesAndSeconds(max)}
                                    </>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className={styles.toolbarPinnedSettings}>
                    {!isLiveMode && (
                        <>
                            <ToolbarMenu loading={disableControls} />
                            <DevToolsToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <MouseTrailToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <AutoPlayToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <SkipInactiveToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <TimelineAnnotationsToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <PlaybackSpeedControlToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                            <PlayerTimeToolbarItem
                                loading={disableControls}
                                renderContext="toolbar"
                            />
                        </>
                    )}
                </div>
                <div className={styles.toolbarRightSection}>
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
                            <SvgMinimize2Icon className={styles.devToolsIcon} />
                        ) : (
                            <SvgFullscreenIcon
                                className={styles.devToolsIcon}
                            />
                        )}
                    </Button>
                </div>
            </div>
        </ToolbarItemsContextProvider>
    );
});

const SessionSegment = React.memo(
    ({
        interval,
        sliderClientX,
        wrapperWidth,
        getSliderTime,
        isLastSegment,
    }: {
        interval: ParsedSessionInterval;
        sliderClientX: number;
        wrapperWidth: number;
        getSliderTime: (sliderTime: number) => number;
        isLastSegment: boolean;
    }) => {
        const { time, sessionStartDateTime } = useReplayerContext();
        const { showPlayerAbsoluteTime } = usePlayerConfiguration();
        const playedColor = interval.active
            ? 'var(--color-purple)'
            : 'var(--color-gray-500)';
        const unplayedColor = interval.active
            ? 'var(--color-purple-200)'
            : 'var(--color-gray-400)';
        const currentRawPercent =
            (time - interval.startTime) /
            (interval.endTime - interval.startTime);
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
                    className={classNames(styles.sliderPopover, {
                        [styles.inactive]: !interval.active,
                    })}
                    style={{
                        left: interval.active
                            ? `${Math.min(
                                  Math.max(sliderClientX - 40, 0),
                                  wrapperWidth - 80
                              )}px`
                            : `${Math.min(
                                  Math.max(sliderClientX - 150, 0),
                                  wrapperWidth - 75
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
                    {!interval.active && (
                        <div className={styles.sliderPopoverDescription}>
                            Inactivity represents time where the user isn't
                            scrolling, clicking or interacting with your
                            application.
                        </div>
                    )}
                    <div className={styles.sliderPopoverTime}>
                        {interval.active
                            ? MillisToMinutesAndSeconds(
                                  getSliderTime(sliderClientX / wrapperWidth)
                              )
                            : MillisToMinutesAndSecondsVerbose(
                                  interval.duration
                              )}
                        {showPlayerAbsoluteTime && interval.active && (
                            <div>
                                (
                                {playerTimeToSessionAbsoluteTime({
                                    sessionStartTime: sessionStartDateTime,
                                    relativeTime: getSliderTime(
                                        sliderClientX / wrapperWidth
                                    ),
                                })}
                                )
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className={classNames(
                        // todo
                        styles.sliderRail,
                        { [styles.firstSegment]: interval.startPercent === 0 },
                        { [styles.lastSegment]: isLastSegment },
                        isPercentInInterval(
                            sliderClientX / wrapperWidth,
                            interval
                        )
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
                                Math.min(Math.max(currentRawPercent, 0), 1) *
                                100
                            }%`,
                        }}
                    ></div>
                </div>
            </div>
        );
    }
);

export const TimelineAnnotationColors: {
    [key in EventsForTimelineKeys[number]]: string;
} = {
    Click: '--color-purple-600',
    Focus: '--color-blue-400',
    Reload: '--color-green-300',
    Navigate: '--color-yellow-400',
    Errors: '--color-red-400',
    Segment: '--color-green-500',
    Track: '--color-blue-300',
    Comments: '--color-green-500',
    Identify: '--color-orange-500',
    Viewport: '--color-purple-600',
    'Web Vitals': '--color-red-600',
    Referrer: '--color-yellow-800',
    TabHidden: '--color-gray-800',
};

export function getAnnotationColor(
    eventTypeKey: typeof EventsForTimeline[number]
) {
    return TimelineAnnotationColors[eventTypeKey];
}
