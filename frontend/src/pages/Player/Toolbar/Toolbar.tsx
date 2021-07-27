import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { FaPause } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

import Modal from '../../../components/Modal/Modal';
import ToggleButton from '../../../components/ToggleButton/ToggleButton';
import Tooltip from '../../../components/Tooltip/Tooltip';
import { useGetAdminQuery } from '../../../graph/generated/hooks';
import { ErrorObject } from '../../../graph/generated/schemas';
import SvgCursorIcon from '../../../static/CursorIcon';
import SvgDevtoolsIcon from '../../../static/DevtoolsIcon';
import SvgPlayIcon from '../../../static/PlayIcon';
import SvgRedoIcon from '../../../static/RedoIcon';
import SvgSkipForwardIcon from '../../../static/SkipForwardIcon';
import SvgUndoIcon from '../../../static/UndoIcon';
import SvgVideoIcon from '../../../static/VideoIcon';
import {
    MillisToMinutesAndSeconds,
    MillisToMinutesAndSecondsVerbose,
} from '../../../util/time';
import { EventsForTimeline, EventsForTimelineKeys } from '../PlayerHook/utils';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import {
    ParsedSessionInterval,
    ReplayerPausedStates,
    ReplayerState,
    useReplayerContext,
} from '../ReplayerContext';
import { getNewTimeWithSkip, usePlayerHotKeys } from '../utils/PlayerHooks';
import { DevToolsContextProvider } from './DevToolsContext/DevToolsContext';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import ErrorModal from './DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import { ErrorModalContextProvider } from './ErrorModalContext/ErrorModalContext';
import SpeedControl from './SpeedControl/SpeedControl';
import TimelineAnnotationsSettings from './TimelineAnnotationsSettings/TimelineAnnotationsSettings';
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
    } = useReplayerContext();
    usePlayerHotKeys();
    const {
        playerSpeed,
        skipInactive,
        setSkipInactive,
        showLeftPanel,
        showRightPanel,
        showDevTools,
        setShowDevTools,
        autoPlayVideo,
        setAutoPlayVideo,
        enableInspectElement,
        selectedDevToolsTab,
        setSelectedDevToolsTab,
        showPlayerMouseTail,
        setShowPlayerMouseTail,
    } = usePlayerConfiguration();
    const { data: admin_data } = useGetAdminQuery({ skip: false });
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
        if (admin_data) {
            if (autoPlayVideo && replayer && isPlayerReady) {
                if (state === ReplayerState.LoadedAndUntouched) {
                    play(time);
                } else if (state === ReplayerState.LoadedWithDeepLink) {
                    pause(time);
                }
            }
        }
    }, [
        admin_data,
        autoPlayVideo,
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
    const leftSidebarWidth = 475;

    return (
        <ErrorModalContextProvider value={{ selectedError, setSelectedError }}>
            <DevToolsContextProvider
                value={{
                    openDevTools: showDevTools,
                    setOpenDevTools: setShowDevTools,
                    selectedTab: selectedDevToolsTab,
                    setSelectedTab: setSelectedDevToolsTab,
                }}
            >
                <TimelineIndicators />
                <DevToolsWindow
                    time={(replayer?.getMetaData().startTime ?? 0) + time}
                    startTime={replayer?.getMetaData().startTime ?? 0}
                />
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
                            sessionIntervals.length > 0 ? 'none' : '#e4e8eb',
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
                                64 -
                                (showLeftPanel ? leftSidebarWidth : 0)
                        )
                    }
                    onMouseLeave={() => setSliderClientX(-1)}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const ratio =
                            (e.clientX -
                                64 -
                                (showLeftPanel ? leftSidebarWidth : 0)) /
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
                    <Tooltip
                        title={isPaused ? 'Play (space)' : 'Pause (space)'}
                        align={{ offset: [8, 0] }}
                    >
                        <div>
                            <button
                                className={classNames(
                                    styles.playSection,
                                    styles.button
                                )}
                                disabled={disableControls || disablePlayButton}
                                onClick={() => {
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
                                    <FaPause
                                        fill="inherit"
                                        className={classNames(
                                            styles.playButtonStyle,
                                            styles.icon
                                        )}
                                    />
                                )}
                            </button>
                        </div>
                    </Tooltip>

                    <Tooltip
                        title="Skip 5 seconds backward (Left arrow)"
                        align={{ offset: [12, 0] }}
                    >
                        <div>
                            <button
                                className={classNames(
                                    styles.undoSection,
                                    styles.button
                                )}
                                disabled={disableControls}
                                onClick={() => {
                                    const newTime = getNewTimeWithSkip({
                                        time,
                                        direction: 'backwards',
                                    });
                                    if (isPaused) {
                                        pause(newTime);
                                    } else {
                                        play(newTime);
                                    }
                                }}
                            >
                                <SvgUndoIcon
                                    fill="inherit"
                                    className={classNames(
                                        styles.skipButtonStyle,
                                        styles.icon
                                    )}
                                />
                            </button>
                        </div>
                    </Tooltip>

                    <Tooltip
                        title="Skip 5 seconds forward (Right arrow)"
                        align={{ offset: [12, 0] }}
                    >
                        <div>
                            <button
                                className={classNames(
                                    styles.redoSection,
                                    styles.button
                                )}
                                disabled={disableControls}
                                onClick={() => {
                                    const totalTime =
                                        replayer?.getMetaData().totalTime ?? 0;
                                    const newTime = getNewTimeWithSkip({
                                        time,
                                        totalTime,
                                        direction: 'forwards',
                                    });
                                    if (isPaused) {
                                        pause(newTime);
                                    } else {
                                        play(newTime);
                                    }
                                }}
                            >
                                <SvgRedoIcon
                                    fill="inherit"
                                    className={classNames(
                                        styles.skipButtonStyle,
                                        styles.icon
                                    )}
                                />
                            </button>
                        </div>
                    </Tooltip>
                    <div className={styles.timeSection}>
                        {disableControls ? (
                            <Skeleton count={1} width="100px" />
                        ) : (
                            <>
                                {MillisToMinutesAndSeconds(time)}&nbsp;/&nbsp;
                                {MillisToMinutesAndSeconds(max)}
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.toolbarRightSection}>
                    <TimelineAnnotationsSettings disabled={disableControls} />
                    <Tooltip
                        title="Automatically starts the video when you open a session."
                        arrowPointAtCenter
                    >
                        <ToggleButton
                            trackingId="PlayerAutoPlaySetting"
                            type="text"
                            onClick={() => {
                                setAutoPlayVideo(!autoPlayVideo);
                            }}
                            toggled={autoPlayVideo}
                            disabled={disableControls}
                            prefixIcon={<SvgVideoIcon />}
                            hideTextLabel={showLeftPanel && showRightPanel}
                        >
                            {autoPlayVideo ? 'Autoplaying' : 'Autoplay'}
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip
                        title="Skip the playback of the inactive portions of the session."
                        arrowPointAtCenter
                    >
                        <ToggleButton
                            trackingId="PlayerSkipInactive"
                            type="text"
                            onClick={() => {
                                setSkipInactive(!skipInactive);
                            }}
                            disabled={disableControls}
                            toggled={skipInactive}
                            prefixIcon={<SvgSkipForwardIcon />}
                            hideTextLabel={showLeftPanel && showRightPanel}
                        >
                            {skipInactive
                                ? 'Skipping inactive'
                                : 'Skip inactive'}
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip
                        title="Show a trail of where the mouse has been. This is useful to keep track of how the mouse has moved."
                        arrowPointAtCenter
                    >
                        <ToggleButton
                            trackingId="PlayerSkipInactive"
                            type="text"
                            onClick={() => {
                                setShowPlayerMouseTail(!showPlayerMouseTail);
                            }}
                            disabled={disableControls}
                            toggled={showPlayerMouseTail}
                            prefixIcon={<SvgCursorIcon />}
                            hideTextLabel={showLeftPanel && showRightPanel}
                        >
                            {showPlayerMouseTail
                                ? 'Showing Mouse Trail'
                                : 'Hiding Mouse Trail'}
                        </ToggleButton>
                    </Tooltip>
                    <SpeedControl disabled={disableControls} />
                    <Tooltip
                        title="View the DevTools to see console logs, errors, and network requests."
                        placement="topLeft"
                        arrowPointAtCenter
                    >
                        <ToggleButton
                            trackingId="PlayerDevTools"
                            type="text"
                            className={styles.devToolsButton}
                            onClick={() => {
                                setShowDevTools(!showDevTools);
                            }}
                            disabled={disableControls}
                            toggled={showDevTools}
                        >
                            <SvgDevtoolsIcon
                                className={classNames(styles.devToolsIcon, {
                                    [styles.devToolsActive]: showDevTools,
                                })}
                            />
                        </ToggleButton>
                    </Tooltip>
                </div>
            </div>
        </ErrorModalContextProvider>
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
