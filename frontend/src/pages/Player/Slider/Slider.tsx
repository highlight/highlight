import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause } from 'react-icons/fa';
import { ReactComponent as CheckMarkCircle } from '../../../static/checkmark-circle.svg';
import { ReactComponent as CrossCircle } from '../../../static/cross-circle.svg';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import styles from './Slider.module.css';

import { Replayer } from 'rrweb';

export const Slider = ({
    max,
    replayer,
    onSelect,
}: {
    max: number;
    replayer: Replayer | undefined;
    onSelect: (newTime: number) => void;
}) => {
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const [current, setCurrent] = useState(0);
    const [speed, setSpeed] = useState(2);
    const [skipInactive, setSkipInactive] = useState(false);
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

    return (
        <>
            <div
                className={styles.sliderWrapper}
                ref={sliderWrapperRef}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    const ratio = e.clientX / wrapperWidth;
                    setCurrent(ratio * max);
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
                                replayer?.pause(newTime);
                                setCurrent(newTime);
                            } else {
                                replayer?.play(newTime);
                                setCurrent(newTime);
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
                        {MillisToMinutesAndSeconds(
                            replayer?.getMetaData().totalTime
                        )}
                    </div>
                </div>
                <div className={styles.toolbarRightSection}>
                    <div
                        onClick={() => {
                            const newSpeed = speed < 4 ? speed * 2 : 1;
                            setSpeed(newSpeed);
                            replayer?.setConfig({ speed: newSpeed });
                        }}
                        className={styles.speedWrapper}
                    >
                        {speed}x
                    </div>
                    <div className={styles.verticalDivider} />
                    <div
                        onClick={() => {
                            replayer?.setConfig({
                                skipInactive: !replayer.config.skipInactive,
                            });
                            setSkipInactive(!skipInactive);
                        }}
                        className={styles.skipInactivity}
                    >
                        <span
                            className={styles.inactiveText}
                            style={{
                                color: skipInactive ? 'green' : 'black',
                            }}
                        >
                            Skip{skipInactive && 'ping'} Inactivity
                        </span>
                        {skipInactive ? (
                            <CheckMarkCircle
                                className={styles.inactiveIcon}
                                fill={'green'}
                            />
                        ) : (
                            <CrossCircle className={styles.inactiveIcon} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
