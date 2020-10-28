import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';
import { ReactComponent as Close } from '../../../static/close.svg';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as CheckMark } from '../../../static/checkmark.svg';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';
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
    const [openDevTools, setOpenDevTools] = useState(false);
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
    }, [openDevTools]);

    return (
        <>
            {openDevTools ? (
                <DevToolsWindow
                    time={(replayer?.getMetaData().startTime ?? 0) + current}
                    startTime={replayer?.getMetaData().startTime ?? 0}
                />
            ) : (
                <></>
            )}
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
                    <div
                        onClick={() => {
                            const newSpeed = speed < 8 ? speed * 2 : 1;
                            setSpeed(newSpeed);
                            replayer?.setConfig({ speed: newSpeed });
                        }}
                        className={styles.speedWrapper}
                    >
                        {speed}x
                    </div>
                    <div
                        onClick={() => {
                            setOpenDevTools(!openDevTools);
                        }}
                        className={styles.skipInactivity}
                        style={{
                            backgroundColor: openDevTools
                                ? '#5629C6'
                                : '#F2EEFB',
                        }}
                    >
                        <span
                            className={styles.inactiveText}
                            style={{
                                color: openDevTools ? 'white' : '#5629c6',
                            }}
                        >
                            DEV TOOLS
                        </span>

                        <DownIcon
                            className={styles.inactiveIcon}
                            fill={openDevTools ? 'white' : '#5629c6'}
                            style={{
                                transform: openDevTools
                                    ? 'rotate(0deg)'
                                    : 'rotate(180deg)',
                            }}
                        />
                    </div>
                    <div
                        onClick={() => {
                            replayer?.setConfig({
                                skipInactive: !replayer.config.skipInactive,
                            });
                            setSkipInactive(!skipInactive);
                        }}
                        className={styles.skipInactivity}
                        style={{
                            backgroundColor: skipInactive
                                ? '#5629C6'
                                : '#F2EEFB',
                        }}
                    >
                        <span
                            className={styles.inactiveText}
                            style={{
                                color: skipInactive ? 'white' : '#5629c6',
                            }}
                        >
                            SKIP INACTIVITY
                        </span>

                        {skipInactive ? (
                            <Close
                                className={styles.inactiveIcon}
                                fill={'white'}
                            />
                        ) : (
                            <CheckMark
                                className={styles.inactiveIcon}
                                fill={'#5629c6'}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
