import React, { useState, useEffect, useRef } from 'react';
import { FaUndoAlt, FaPlay, FaPause, FaCog } from 'react-icons/fa';
import { ReactComponent as Close } from '../../../static/close.svg';
import { ReactComponent as DownIcon } from '../../../static/chevron-down.svg';
import { ReactComponent as CheckMark } from '../../../static/checkmark.svg';
import { MillisToMinutesAndSeconds } from '../../../util/time';
import { DevToolsWindow } from './DevToolsWindow/DevToolsWindow';

import { Menu, Dropdown, Switch, Slider } from 'antd';
import styles from './Toolbar.module.css';
import { Replayer } from 'rrweb';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

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
    const [openSpeedMenu, setOpenSpeedMenu] = useState(false);
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
                    <Dropdown
                        overlay={
                            <div className={styles.dropdownMenu}>
                                <div className={styles.dropdownInner}>
                                    {openSpeedMenu ? (
                                        <>
                                            <div
                                                onClick={() =>
                                                    setOpenSpeedMenu(false)
                                                }
                                                className={
                                                    styles.dropdownSection
                                                }
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'flex-start',
                                                    cursor: 'pointer',
                                                    borderBottom:
                                                        '1px solid #eaeaea',
                                                }}
                                            >
                                                <DownIcon
                                                    style={{
                                                        height: 15,
                                                        width: 15,
                                                        transform:
                                                            'rotate(90deg)',
                                                        marginRight: 10,
                                                    }}
                                                />
                                                <span>Hello</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className={
                                                    styles.dropdownSection
                                                }
                                            >
                                                <span>Dev Tools</span>
                                                <Switch
                                                    checked={openDevTools}
                                                    className={
                                                        styles.switchStyle
                                                    }
                                                    onChange={(e) =>
                                                        setOpenDevTools(e)
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.dropdownSection
                                                }
                                            >
                                                <span>Skip Inactive</span>
                                                <Switch
                                                    checked={skipInactive}
                                                    className={
                                                        styles.switchStyle
                                                    }
                                                    onChange={(e) =>
                                                        setSkipInactive(e)
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.dropdownSection
                                                }
                                                style={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    setOpenSpeedMenu(true)
                                                }
                                            >
                                                <span>Playback</span>
                                                <div
                                                    style={{
                                                        float: 'right',
                                                        marginLeft: 'auto',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <span>{speed}x</span>
                                                    <DownIcon
                                                        style={{
                                                            height: 15,
                                                            width: 15,
                                                            transform:
                                                                'rotate(270deg)',
                                                            float: 'right',
                                                            marginLeft: 'auto',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        }
                        placement={'bottomRight'}
                        visible
                    >
                        <a className="ant-dropdown-link" href="#">
                            <FaCog
                                fill="black"
                                className={styles.playButtonStyle}
                            />
                        </a>
                    </Dropdown>
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
                </div>
            </div>
        </>
    );
};
