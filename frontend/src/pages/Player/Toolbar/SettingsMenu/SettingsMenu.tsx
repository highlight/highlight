import React, { useState, useEffect, useRef } from 'react';
import { Menu, Dropdown, Switch, Slider } from 'antd';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { FaUndoAlt, FaPlay, FaPause, FaCog } from 'react-icons/fa';

import toolbarStyles from '../Toolbar.module.css';
import styles from './SettingsMenu.module.css';

export const SettingsMenu = ({
    skipInactive,
    openDevTools,
    speed,
    onSkipInactiveChange,
    onOpenDevToolsChange,
    onSpeedChange,
}: {
    skipInactive: boolean;
    openDevTools: boolean;
    speed: number;
    onSkipInactiveChange: () => void;
    onOpenDevToolsChange: () => void;
    onSpeedChange: (s: number) => void;
}) => {
    const [openSpeedMenu, setOpenSpeedMenu] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
        <Dropdown
            overlay={
                <div
                    className={toolbarStyles.dropdownMenu}
                    onMouseLeave={() => {
                        setVisible(false);
                        setOpenSpeedMenu(false);
                    }}
                >
                    <div
                        onBlur={() => console.log('blur')}
                        className={toolbarStyles.dropdownInner}
                    >
                        {openSpeedMenu ? (
                            <>
                                <div
                                    onClick={() => setOpenSpeedMenu(false)}
                                    className={styles.playbackTopSection}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eaeaea',
                                    }}
                                >
                                    <DownIcon
                                        style={{
                                            height: 15,
                                            width: 15,
                                            transform: 'rotate(90deg)',
                                            marginRight: 10,
                                        }}
                                    />
                                    <span>Playback Speed</span>
                                </div>
                                <div className={styles.playbackWrapper}>
                                    {[0.5, 1, 1.5, 2, 4, 6, 8].map((v) => (
                                        <div
                                            className={
                                                styles.playbackSpeedElement
                                            }
                                            onClick={() => {
                                                onSpeedChange(v);
                                                setOpenSpeedMenu(false);
                                            }}
                                        >
                                            <span>{v}</span>
                                            {speed === v ? (
                                                <CheckIcon
                                                    className={styles.checkIcon}
                                                />
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={toolbarStyles.dropdownSection}>
                                    <span>Dev Tools</span>
                                    <Switch
                                        checked={openDevTools}
                                        className={styles.switchStyle}
                                        onChange={onOpenDevToolsChange}
                                    />
                                </div>
                                <div className={toolbarStyles.dropdownSection}>
                                    <span>Skip Inactive</span>
                                    <Switch
                                        checked={skipInactive}
                                        className={styles.switchStyle}
                                        onChange={onSkipInactiveChange}
                                    />
                                </div>
                                <div
                                    className={toolbarStyles.dropdownSection}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setOpenSpeedMenu(true)}
                                >
                                    <span>Playback</span>
                                    <div
                                        style={{
                                            float: 'right',
                                            marginLeft: 'auto',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <span>{speed}x</span>
                                        <DownIcon
                                            style={{
                                                height: 15,
                                                width: 15,
                                                transform: 'rotate(270deg)',
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
            visible={visible}
        >
            <a
                onClick={() => setVisible(true)}
                className="ant-dropdown-link"
                href="#"
            >
                <FaCog fill="black" className={styles.settingsStyle} />
            </a>
        </Dropdown>
    );
};
