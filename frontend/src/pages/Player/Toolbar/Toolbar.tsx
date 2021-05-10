import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaPause } from 'react-icons/fa';
import { useLocalStorage } from '@rehooks/local-storage';
import {
    MillisToMinutesAndSeconds,
    MillisToMinutesAndSecondsVerbose,
} from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import {
    DevToolsContextProvider,
    DevToolTabs,
} from './DevToolsContext/DevToolsContext';
import Draggable from 'react-draggable';

import styles from './Toolbar.module.scss';
import ReplayerContext, {
    ParsedSessionComment,
    ParsedSessionInterval,
    ReplayerState,
} from '../ReplayerContext';
import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';
import TimelineAnnotationsSettings from './TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import { EventsForTimeline, EventsForTimelineKeys } from '../PlayerHook/utils';
import { ErrorModalContextProvider } from './ErrorModalContext/ErrorModalContext';
import { ErrorObject } from '../../../graph/generated/schemas';
import Modal from '../../../components/Modal/Modal';
import ErrorModal from './DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import TimelineCommentAnnotation from './TimelineAnnotation/TimelineCommentAnnotation';
import TimelineEventAnnotation from './TimelineAnnotation/TimelineEventAnnotation';
import TimelineErrorAnnotation from './TimelineAnnotation/TimelineErrorAnnotation';
import SvgDevtoolsIcon from '../../../static/DevtoolsIcon';
import Button from '../../../components/Button/Button/Button';
import Tooltip from '../../../components/Tooltip/Tooltip';
import SpeedControl from './SpeedControl/SpeedControl';
import SvgRedoIcon from '../../../static/RedoIcon';
import SvgUndoIcon from '../../../static/UndoIcon';
import SvgPlayIcon from '../../../static/PlayIcon';
import { getNewTimeWithSkip, usePlayerHotKeys } from '../utils/hooks';

export const Toolbar = ({ onResize }: { onResize: () => void }) => {
    const {
        replayer,
        setTime,
        time,
        state,
        play,
        pause,
        sessionIntervals,
        sessionCommentIntervals,
    } = useContext(ReplayerContext);
    usePlayerHotKeys();
    const max = replayer?.getMetaData().totalTime ?? 0;
    const sliderWrapperRef = useRef<HTMLButtonElement>(null);
    const [selectedError, setSelectedError] = useState<ErrorObject | undefined>(
        undefined
    );
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [sliderClientX, setSliderClientX] = useState<number>(-1);
    const [speed] = useLocalStorage('highlightMenuSpeed', 2);
    const [skipInactive, setSkipInactive] = useLocalStorage(
        'highlightMenuSkipInactive',
        true
    );
    const [openDevTools, setOpenDevTools] = useLocalStorage(
        'highlightMenuOpenDevTools',
        false
    );
    const [autoPlayVideo, setAutoPlayVideo] = useLocalStorage(
        'highlightMenuAutoPlayVideo',
        false
    );
    const [enableDOMInteractions] = useLocalStorage(
        'highlightMenuEnableDOMInteractions',
        false
    );
    const [selectedDevToolsTab, setSelectedDevToolsTab] = useLocalStorage(
        'highlightSelectedDevtoolTabs',
        DevToolTabs.Errors
    );
    const [] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);
    const isPaused =
        state === ReplayerState.Paused ||
        state === ReplayerState.LoadedAndUntouched ||
        state === ReplayerState.LoadedWithDeepLink ||
        state === ReplayerState.SessionRecordingStopped;

    useEffect(() => {
        onResize();
    }, [openDevTools, onResize]);

    useEffect(() => {
        if (replayer) {
            if (enableDOMInteractions) {
                replayer.enableInteract();
            } else {
                replayer.disableInteract();
            }
        }
    }, [enableDOMInteractions, replayer]);

    useEffect(() => {
        replayer?.setConfig({ skipInactive, speed });
    }, [replayer, skipInactive, speed]);

    // Automatically start the player if the user has set the preference.
    useEffect(() => {
        if (autoPlayVideo && replayer) {
            if (state === ReplayerState.LoadedAndUntouched) {
                play(time);
            } else if (state === ReplayerState.LoadedWithDeepLink) {
                pause(time);
            }
        }
    }, [autoPlayVideo, replayer, time, play, state, pause]);

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

    const disableControls = state === ReplayerState.Loading;
    // The play button should be disabled if the player has reached the end.
    const disablePlayButton = time >= (replayer?.getMetaData().totalTime ?? 0);

    return (
        <ErrorModalContextProvider value={{ selectedError, setSelectedError }}>
            <DevToolsContextProvider
                value={{
                    openDevTools,
                    setOpenDevTools,
                    selectedTab: selectedDevToolsTab,
                    setSelectedTab: setSelectedDevToolsTab,
                }}
            >
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
                            comments={sessionCommentIntervals[ind]}
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
                        setSliderClientX(e.clientX - 64)
                    }
                    onMouseLeave={() => setSliderClientX(-1)}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const ratio = (e.clientX - 64) / wrapperWidth;
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
                    >
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
                    </Tooltip>

                    <Tooltip title="Skip 5 seconds backward (Left arrow)">
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
                    </Tooltip>

                    <Tooltip title="Skip 5 seconds forward (Right arrow)">
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
                    <TimelineAnnotationsSettings />
                    <Tooltip
                        title="Automatically starts the video when you open a session."
                        arrowPointAtCenter
                    >
                        <Button
                            type="text"
                            className={classNames(styles.autoPlayButton)}
                            onClick={() => {
                                setAutoPlayVideo(!autoPlayVideo);
                            }}
                        >
                            {autoPlayVideo ? 'Autoplay on' : 'Autoplay off'}
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title="Skip the playback of the inactive portions of the session."
                        arrowPointAtCenter
                    >
                        <Button
                            type="text"
                            className={classNames(styles.skipInactiveButton, {
                                [styles.skipInactiveButtonActive]: skipInactive,
                            })}
                            onClick={() => {
                                setSkipInactive(!skipInactive);
                            }}
                        >
                            {skipInactive
                                ? 'Skipping inactive'
                                : 'Skip inactive'}
                        </Button>
                    </Tooltip>
                    <SpeedControl />
                    <Tooltip
                        title="View the DevTools to see console logs, errors, and network requests."
                        placement="topLeft"
                        arrowPointAtCenter
                    >
                        <Button
                            type="text"
                            className={styles.devToolsButton}
                            onClick={() => {
                                setOpenDevTools(!openDevTools);
                            }}
                        >
                            <SvgDevtoolsIcon
                                className={classNames(styles.devToolsIcon, {
                                    [styles.devToolsActive]: openDevTools,
                                })}
                            />
                        </Button>
                    </Tooltip>
                </div>
            </div>
        </ErrorModalContextProvider>
    );
};

const SessionSegment = ({
    interval,
    comments,
    sliderClientX,
    wrapperWidth,
    getSliderTime,
}: {
    interval: ParsedSessionInterval;
    comments: ParsedSessionComment[];
    sliderClientX: number;
    wrapperWidth: number;
    getSliderTime: (sliderTime: number) => number;
}) => {
    const { time } = useContext(ReplayerContext);
    const [openDevTools] = useLocalStorage('highlightMenuOpenDevTools', false);
    const [
        selectedTimelineAnnotationTypes,
    ] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);
    const playedColor = interval.active ? '#5629c6' : '#808080';
    const unplayedColor = interval.active ? '#EEE7FF' : '#d2d2d2';
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
            {!openDevTools && (
                <>
                    <div
                        className={styles.annotationsContainer}
                        style={{
                            width: `${
                                (interval.endPercent - interval.startPercent) *
                                100
                            }%`,
                        }}
                    >
                        {interval.sessionEvents?.map((event) => (
                            <TimelineEventAnnotation
                                event={event}
                                key={event.identifier}
                            />
                        ))}
                    </div>
                    {selectedTimelineAnnotationTypes.includes('Errors') && (
                        <div
                            className={styles.annotationsContainer}
                            style={{
                                width: `${
                                    (interval.endPercent -
                                        interval.startPercent) *
                                    100
                                }%`,
                            }}
                        >
                            {interval.errors.map((error) => (
                                <TimelineErrorAnnotation
                                    key={error.id}
                                    error={error}
                                />
                            ))}
                        </div>
                    )}
                    {selectedTimelineAnnotationTypes.includes('Comments') && (
                        <div
                            className={styles.annotationsContainer}
                            style={{
                                width: `${
                                    (interval.endPercent -
                                        interval.startPercent) *
                                    100
                                }%`,
                            }}
                        >
                            {comments?.map((comment) => (
                                <TimelineCommentAnnotation
                                    key={comment.id}
                                    comment={comment}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
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

const TimelineAnnotationColors: {
    [key in EventsForTimelineKeys[number]]: string;
} = {
    Click: '--color-purple-light',
    Focus: '--color-blue',
    Reload: '--color-green-light',
    Navigate: '--color-yellow',
    Errors: '--color-red',
    Segment: '--color-orange-400',
    Track: '--color-blue-light',
    Comments: '--color-green-dark',
};

export function getAnnotationColor(
    eventTypeKey: typeof EventsForTimeline[number]
) {
    return TimelineAnnotationColors[eventTypeKey];
}
