import React, { useState, useEffect, useRef, useContext } from 'react';
import { FaUndoAlt, FaPlay, FaPause, FaRedoAlt } from 'react-icons/fa';
import { useLocalStorage } from '@rehooks/local-storage';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import { OpenDevToolsContext } from './DevToolsContext/DevToolsContext';
import Draggable from 'react-draggable';

import styles from './Toolbar.module.scss';
import ReplayerContext, { ReplayerState } from '../ReplayerContext';
import classNames from 'classnames';

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
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [speed, setSpeed] = useLocalStorage('highlightMenuSpeed', 2);
    const [skipInactive, setSkipInactive] = useLocalStorage(
        'highlightMenuSkipInactive',
        false
    );
    const [openDevTools, setOpenDevTools] = useLocalStorage(
        'highlightMenuOpenDevTools',
        false
    );
    const [autoPlayVideo, setAutoPlayVideo] = useLocalStorage(
        'highlightMenuAutoPlayVideo',
        false
    );

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);
    const [isDragged, setIsDragged] = useState(false);
    const isPaused =
        state === ReplayerState.Paused ||
        state === ReplayerState.LoadedAndUntouched;

    // When not paused and not dragged, update the current time.
    // When the current time is updated, the function calls itself again.
    useEffect(() => {
        if (replayer) {
            if (!isPaused && !isDragged) {
                setTimeout(() => {
                    setTime(replayer.getCurrentTime());
                }, 50);
            }
        }
    }, [replayer, isPaused, isDragged, time, setTime]);

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
                play(0);
            }, 100);
        }
    }, [autoPlayVideo, replayer, time, play, state]);

    let endLogger = (e: any, data: any) => {
        let newTime = (e.x / wrapperWidth) * max;
        newTime = Math.max(0, newTime);
        newTime = Math.min(max, newTime);

        setLastCanvasPreview(e.x);
        setIsDragged(false);

        if (isPaused) {
            pause(newTime);
        } else {
            play(newTime);
        }
    };

    let startDraggable = (e: any, data: any) => {
        setLastCanvasPreview(data.x);
        setIsDragged(true);
        if (!isPaused) {
            pause();
        }
    };

    let onDraggable = (e: any, data: any) => {
        let newTime = (data.x / wrapperWidth) * max;

        setTime(newTime);

        // TODO: Add Math.abs to enable both forward and backward scrolling
        // Only forward is supported due as going backwards creates a time heavy operation
        if (data.x - lastCanvasPreview > 10) {
            setLastCanvasPreview(data.x);
        }
    };

    /**
     * The time to skip along the timeline. Used to skip X time back or forwards.
     */
    const SKIP_DURATION = 7000;

    const disableControls = state === ReplayerState.Loading;

    return (
        <>
            <OpenDevToolsContext.Provider
                value={{
                    openDevTools,
                    setOpenDevTools,
                }}
            >
                <DevToolsWindow
                    time={(replayer?.getMetaData().startTime ?? 0) + time}
                    startTime={replayer?.getMetaData().startTime ?? 0}
                />
            </OpenDevToolsContext.Provider>
            <button
                disabled={disableControls}
                className={styles.sliderWrapper}
                ref={sliderWrapperRef}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    const ratio = e.clientX / wrapperWidth;
                    setTime(ratio * max);
                }}
            >
                <div
                    className={styles.sliderRail}
                    style={{
                        background: `linear-gradient(
        to right,
    ${sessionIntervals
        .map(
            (interval) =>
                (interval.active ? '#5629c6' : '#b5a4e2') +
                ' ' +
                (interval.startTime * 100) / max +
                '%, ' +
                (interval.active ? '#5629c6' : '#b5a4e2') +
                ' ' +
                (interval.endTime * 100) / max +
                '%'
        )
        .join()})`,
                    }}
                ></div>

                <Draggable
                    axis="x"
                    bounds="parent"
                    onStop={endLogger}
                    onDrag={onDraggable}
                    onStart={startDraggable}
                    disabled={disableControls}
                    position={{
                        x: Math.max((time / max) * wrapperWidth - 15, 0),
                        y: 0,
                    }}
                >
                    <div className={styles.indicator} />
                </Draggable>
            </button>
            <div className={styles.toolbarSection}>
                <div className={styles.toolbarLeftSection}>
                    <button
                        className={classNames(
                            styles.playSection,
                            styles.button
                        )}
                        disabled={disableControls}
                        onClick={() => {
                            if (isPaused) {
                                play(time);
                                setIsDragged(false);
                            } else {
                                pause(time);
                                setIsDragged(false);
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
                        {MillisToMinutesAndSeconds(time)}&nbsp;/&nbsp;
                        {MillisToMinutesAndSeconds(max)}
                    </div>
                </div>
                <div className={styles.toolbarRightSection}>
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
                    />
                </div>
            </div>
        </>
    );
};
