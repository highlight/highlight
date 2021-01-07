import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';
import { useLocalStorage } from '@rehooks/local-storage';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import { OpenDevToolsContext } from './DevToolsContext/DevToolsContext';
import Draggable from 'react-draggable'; 

import styles from './Toolbar.module.scss';
import { Replayer } from 'rrweb';

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
    const [skipInactive, setSkipInactive] = useLocalStorage('highlightMenuSkipInactive', false);
    const [openDevTools, setOpenDevTools] = useLocalStorage('highlightMenuOpenDevTools', false);
    const [paused, setPaused] = useState(true);

    const [lastCanvasPreview, setLastCanvasPreview] = useState(0);

    useEffect(() => {
        if (replayer) {
            setInterval(() => {
                if (!paused) {
                    if (!isNaN(replayer.getCurrentTime())) {
                        setCurrent(replayer.getCurrentTime());
                    }
                }
            }, 50);
        }
    }, [replayer, paused]);

    useEffect(() => {
        setTimeout(() => onResize(), 50);
    }, [openDevTools, onResize]);

    useEffect(() => {
        replayer?.setConfig({ skipInactive, speed });
    }, [replayer, skipInactive, speed]);

    useEffect(() => {
        setTimeout(() => {
            replayer?.pause((lastCanvasPreview / wrapperWidth) * max)
        }, 1);
    }, [lastCanvasPreview]);

    let endLogger = (e: any, data: any) => {
        let newTime = (e.x / wrapperWidth) * max
        newTime = Math.max(0, newTime)
        newTime = Math.min(max, newTime)

        setCurrent(newTime)
        setLastCanvasPreview(e.x)

        if (paused) {
            setCurrent(newTime);
            replayer?.pause(newTime);
        } else {
            setCurrent(newTime);
            replayer?.play(newTime);
        }
    };

    let startDraggable = (e: any, data: any) => {
        setLastCanvasPreview(e.x)
        if (!paused) {
            replayer?.pause();
            setPaused(true);
        } 
    }

    let onDraggable  = (e: any, data: any) => {
        let newTime = (e.x / (wrapperWidth)) * max

        setCurrent(newTime);
        if (e.x - lastCanvasPreview > 10) {
            setLastCanvasPreview(e.x)
        } 
    }

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
                        y: 0
                    }}
                >
                    <div
                        className={styles.indicator}
                    />
                </Draggable>

            </div>
            <div className={styles.toolbarSection}>
                <div className={styles.toolbarLeftSection}>
                    <div
                        className={styles.playSection}
                        onClick={() => {
                            if (paused) {
                                replayer?.play(current);
                                setPaused(false);
                            } else {
                                replayer?.pause();
                                setPaused(true);
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
                    />
                </div>
            </div>
        </>
    );
};
