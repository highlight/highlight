import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaUndoAlt, FaPlay, FaPause, FaRedoAlt } from 'react-icons/fa';
import { useLocalStorage } from '@rehooks/local-storage';
import {
    MillisToMinutesAndSeconds,
    MillisToMinutesAndSecondsVerbose,
} from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import {
    DevToolsContextProvider,
    DevToolTabs,
} from './DevToolsContext/DevToolsContext';
import Draggable from 'react-draggable';

import styles from './Toolbar.module.scss';
import ReplayerContext, {
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
import TimelineErrorAnnotation from './TimelineAnnotation/TimelineErrorAnnotation';
import TimelineEventAnnotation from './TimelineAnnotation/TimelineEventAnnotation';

export const Toolbar = ({ onResize }: { onResize: () => void }) => {
    const {
        replayer,
        setTime,
        time,
        state,
        play,
        pause,
        sessionIntervals,
    } = useContext(ReplayerContext);
    const max = replayer?.getMetaData().totalTime ?? 0;
    const sliderWrapperRef = useRef<HTMLButtonElement>(null);
    const [selectedError, setSelectedError] = useState<ErrorObject | undefined>(
        undefined
    );
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [sliderClientX, setSliderClientX] = useState<number>(-1);
    const [speed, setSpeed] = useLocalStorage('highlightMenuSpeed', 2);
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
    const [selectedDevToolsTab, setSelectedDevToolsTab] = useLocalStorage(
        'highlightSelectedDevtoolTabs',
        DevToolTabs.Errors
    );
    const [showRightPanel, setShowRightPanel] = useLocalStorage(
        'highlightMenuShowRightPanel',
        true
    );
    const [] = useLocalStorage('highlightTimelineAnnotationTypes', [
        ...EventsForTimeline,
    ]);

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);
    const isPaused =
        state === ReplayerState.Paused ||
        state === ReplayerState.LoadedAndUntouched;

    useEffect(() => {
        onResize();
    }, [openDevTools, onResize]);

    useEffect(() => {
        replayer?.setConfig({ skipInactive, speed });
    }, [replayer, skipInactive, speed]);

    // Automatically start the player if the user has set the preference.
    useEffect(() => {
        if (
            autoPlayVideo &&
            replayer &&
            state === ReplayerState.LoadedAndUntouched
        ) {
            setTimeout(() => {
                play(time);
            }, 100);
        }
    }, [autoPlayVideo, replayer, time, play, state]);

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

    /**
     * The time to skip along the timeline. Used to skip X time back or forwards.
     */
    const SKIP_DURATION = 7000;

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
                    <button
                        className={classNames(
                            styles.playSection,
                            styles.button
                        )}
                        disabled={disableControls || disablePlayButton}
                        onClick={() => {
                            console.log(
                                `[Highlight] Player Info: \nPlayback Time: ${time}\nClient Position: ${sliderClientX}`
                            );
                            if (isPaused) {
                                play(time);
                            } else {
                                pause(time);
                            }
                        }}
                    >
                        {isPaused ? (
                            <FaPlay
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
                    <button
                        className={classNames(
                            styles.undoSection,
                            styles.button
                        )}
                        disabled={disableControls}
                        onClick={() => {
                            const newTime = Math.max(time - SKIP_DURATION, 0);
                            if (isPaused) {
                                pause(newTime);
                            } else {
                                play(newTime);
                            }
                        }}
                    >
                        <FaUndoAlt
                            fill="inherit"
                            className={classNames(
                                styles.skipButtonStyle,
                                styles.icon
                            )}
                        />
                    </button>
                    <button
                        className={classNames(
                            styles.redoSection,
                            styles.button
                        )}
                        disabled={disableControls}
                        onClick={() => {
                            const totalTime =
                                replayer?.getMetaData().totalTime ?? 0;
                            const newTime = Math.min(
                                time + SKIP_DURATION,
                                totalTime
                            );
                            if (isPaused) {
                                pause(newTime);
                            } else {
                                play(newTime);
                            }
                        }}
                    >
                        <FaRedoAlt
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
                                {MillisToMinutesAndSeconds(time)}&nbsp;/&nbsp;
                                {MillisToMinutesAndSeconds(max)}
                            </>
                        )}
                    </div>
                </div>
                <div className={styles.toolbarRightSection}>
                    <TimelineAnnotationsSettings />
                    <SettingsMenu
                        skipInactive={skipInactive}
                        onSkipInactiveChange={() =>
                            setSkipInactive(!skipInactive)
                        }
                        openDevTools={openDevTools}
                        onOpenDevToolsChange={() =>
                            setOpenDevTools(!openDevTools)
                        }
                        speed={speed}
                        onSpeedChange={(s: number) => {
                            setSpeed(s);
                            replayer?.setConfig({ speed: s });
                        }}
                        autoPlayVideo={autoPlayVideo}
                        onAutoPlayVideoChange={() => {
                            setAutoPlayVideo(!autoPlayVideo);
                        }}
                        showRightPanel={showRightPanel}
                        onShowRightPanelChange={() => {
                            setShowRightPanel(!showRightPanel);
                        }}
                    />
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
    Segment: '--color-orange',
    Track: '--color-blue-light',
};

export function getAnnotationColor(
    eventTypeKey: typeof EventsForTimeline[number]
) {
    return TimelineAnnotationColors[eventTypeKey];
}
