import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
import { SettingsMenu } from './SettingsMenu/SettingsMenu';
import { OpenDevToolsContext } from './DevToolsContext/DevToolsContext';

import styles from './Toolbar.module.css';
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
    const [speed, setSpeed] = useState(2);
    const [skipInactive, setSkipInactive] = useState(false);
    const [openDevTools, setOpenDevTools] = useState(true);
    const [paused, setPaused] = useState(true);
    const timePercentage = Math.max((current / max) * 100, 0);
    const indicatorStyle = `min(${
        timePercentage.toString() + '%'
    }, ${wrapperWidth}px - 15px)`;

    useEffect(() => {
        if (replayer) {
            setInterval(() => {
                if (!paused) {
                    setCurrent(replayer.getCurrentTime());
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
                <div
                    className={styles.indicator}
                    style={{
                        marginLeft: indicatorStyle,
                    }}
                />
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
