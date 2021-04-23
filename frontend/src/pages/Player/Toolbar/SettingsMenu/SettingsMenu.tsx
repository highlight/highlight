import React, { useState } from 'react';
import { Dropdown, Switch } from 'antd';
import { ReactComponent as DownIcon } from '../../../../static/chevron-down.svg';
import { ReactComponent as CheckIcon } from '../../../../static/check.svg';
import { FaCog } from 'react-icons/fa';

import toolbarStyles from '../Toolbar.module.scss';
import styles from './SettingsMenu.module.scss';

export const SettingsMenu = ({
    skipInactive,
    autoPlayVideo,
    speed,
    onSkipInactiveChange,
    onAutoPlayVideoChange,
    onSpeedChange,
}: {
    skipInactive: boolean;
    autoPlayVideo: boolean;
    speed: number;
    onSkipInactiveChange: () => void;
    onAutoPlayVideoChange: () => void;
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
                    <div className={toolbarStyles.dropdownInner}>
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
                                            key={v}
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
                                    <span>Skip Inactive</span>
                                    <Switch
                                        checked={skipInactive}
                                        className={styles.switchStyle}
                                        onChange={onSkipInactiveChange}
                                    />
                                </div>
                                <div className={toolbarStyles.dropdownSection}>
                                    <span>Autoplay Video</span>
                                    <Switch
                                        checked={autoPlayVideo}
                                        className={styles.switchStyle}
                                        onChange={onAutoPlayVideoChange}
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
            <button
                onClick={() => setVisible((previousValue) => !previousValue)}
                className={styles.settingsStyleWrapper}
            >
                <FaCog fill="black" className={styles.settingsStyle} />
            </button>
        </Dropdown>
    );
};
