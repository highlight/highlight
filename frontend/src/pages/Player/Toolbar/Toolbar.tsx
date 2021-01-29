import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';
import { useLocalStorage } from '@rehooks/local-storage';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import { OpenDevToolsContext } from './DevToolsContext/DevToolsContext';
import Draggable from 'react-draggable';

import styles from './Toolbar.module.scss';
import { Replayer } from '@highlight-run/rrweb';

export const Toolbar = ({
    replayer,
    onSelect,
    onResize,
}: {
    replayer: Replayer | undefined;
    onSelect: (newTime: number) => void;
    onResize: () => void;
}) => {
    const max = replayer?.getMetaData().totalTime ?? 0;
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [current, setCurrent] = useState(0);
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
    const [paused, setPaused] = useState(true);
    // Represents whether the user has directly or indirectly interacted with the player.
    const [touched, setTouched] = useState(false);

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);
    const [isDragged, setIsDragged] = useState(false);

    // When not paused and not dragged, update the current time.
    // When the current time is updated, the function calls itself again.
    useEffect(() => {
        if (replayer) {
            if (!paused && !isDragged) {
                setTimeout(() => {
                    setCurrent(replayer.getCurrentTime());
                }, 50);
            }
        }
    }, [replayer, paused, isDragged, current]);

    useEffect(() => {
        onResize();
    }, [openDevTools, onResize]);

    useEffect(() => {
        replayer?.setConfig({ skipInactive, speed });
    }, [replayer, skipInactive, speed]);

    useEffect(() => {
        setTimeout(() => {
            replayer?.pause((lastCanvasPreview / wrapperWidth) * max);
        }, 1);
    }, [replayer, lastCanvasPreview, wrapperWidth, max]);

    // Automatically start the player if the user has set the preference.
    useEffect(() => {
        if (autoPlayVideo && replayer && !touched) {
            setTimeout(() => {
                replayer.play(0);
                setPaused(false);
            }, 100);
        }
    }, [autoPlayVideo, replayer, current, touched]);

    useEffect(() => {
        if (current > 0) {
            setTouched(true);
        }
    }, [current]);

    let endLogger = (e: any, data: any) => {
        let newTime = (e.x / wrapperWidth) * max;
        newTime = Math.max(0, newTime);
        newTime = Math.min(max, newTime);

        setCurrent(newTime);
        setLastCanvasPreview(e.x);
        setIsDragged(false);

        if (paused) {
            setCurrent(newTime);
            replayer?.pause(newTime);
        } else {
            setCurrent(newTime);
            replayer?.play(newTime);
        }
    };

    let startDraggable = (e: any, data: any) => {
        setLastCanvasPreview(data.x);
        setIsDragged(true);
        if (!paused) {
            replayer?.pause();
            setPaused(true);
        }
    };

    let onDraggable = (e: any, data: any) => {
        let newTime = (data.x / wrapperWidth) * max;

        setCurrent(newTime);

        // TODO: Add Math.abs to enable both forward and backward scrolling
        // Only forward is supported due as going backwards creates a time heavy operation
        if (data.x - lastCanvasPreview > 10) {
            setLastCanvasPreview(data.x);
        }
    };

    return (
        <>
            <OpenDevToolsContext.Provider
                value={{
                    openDevTools,
                    setOpenDevTools,
                }}
            >
                <DevToolsWindow
                    time={(replayer?.getMetaData().startTime ?? 0) + current}
                    startTime={replayer?.getMetaData().startTime ?? 0}
                />
            </OpenDevToolsContext.Provider>
            <div
                className={styles.sliderWrapper}
                ref={sliderWrapperRef}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    const ratio = e.clientX / wrapperWidth;
                    setCurrent(ratio * max);
                    setPaused(true);
                    onSelect(ratio * max);
                }}
            >
                <div className={styles.sliderRail}></div>

                <Draggable
                    axis="x"
                    bounds="parent"
                    onStop={endLogger}
                    onDrag={onDraggable}
                    onStart={startDraggable}
                    position={{
                        x: Math.max((current / max) * wrapperWidth - 15, 0),
                        y: 0,
                    }}
                >
                    <div className={styles.indicator} />
                </Draggable>
            </div>
            <div className={styles.toolbarSection}>
                <div className={styles.toolbarLeftSection}>
                    <div
                        className={styles.playSection}
                        // TODO: Add waiting toggle, so a user does not pause while the player is loading.
                        onClick={() => {
                            if (paused) {
                                replayer?.play(current);
                                setPaused(false);
                                setIsDragged(false);
                            } else {
                                replayer?.pause();
                                setPaused(true);
                                setIsDragged(false);
                            }
                        }}
                    >
                        {paused ? (
                            <FaPlay
                                fill="black"
                                className={styles.playButtonStyle}
                            />
                        ) : (
                            <FaPause
                                fill="black"
                                className={styles.playButtonStyle}
                            />
                        )}
                    </div>
                    <div
                        className={styles.undoSection}
                        onClick={() => {
                            const newTime =
                                current - 7000 < 0 ? 0 : current - 7000;
                            if (paused) {
                                setCurrent(newTime);
                                replayer?.pause(newTime);
                            } else {
                                setCurrent(newTime);
                                replayer?.play(newTime);
                            }
                        }}
                    >
                        <FaUndoAlt
                            fill="black"
                            className={styles.undoButtonStyle}
                        />
                    </div>
                    <div className={styles.timeSection}>
                        {MillisToMinutesAndSeconds(current)}&nbsp;/&nbsp;
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
