import MenuItem from '@components/Menu/MenuItem';
import Switch from '@components/Switch/Switch';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import Tooltip from '@components/Tooltip/Tooltip';
import SvgClockIcon from '@icons/ClockIcon';
import SvgCloseIcon from '@icons/CloseIcon';
import SvgDevtoolsIcon from '@icons/DevtoolsIcon';
import SvgFastForwardIcon from '@icons/FastForwardIcon';
import SvgMouseIcon from '@icons/MouseIcon';
import SvgPinTackIcon from '@icons/PinTackIcon';
import SvgVideoIcon from '@icons/VideoIcon';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import { PlayerPageProductTourSelectors } from '@pages/Player/PlayerPageProductTour/PlayerPageProductTour';
import SpeedControl from '@pages/Player/Toolbar/SpeedControl/SpeedControl';
import TimelineAnnotationsSettings from '@pages/Player/Toolbar/TimelineAnnotationsSettings/TimelineAnnotationsSettings';
import {
    ToolbarItem,
    useToolbarItemsContext,
} from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext';
import { Dropdown, Menu } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';

import toolbarStyles from '../Toolbar.module.scss';
import styles from './ToolbarItems.module.scss';

type ToolbarItemRenderContext = 'toolbar' | 'menu';

interface ToolbarItemProps {
    loading: boolean;
    renderContext: ToolbarItemRenderContext;
}

/**
 * Determines if the `ToolbarItem` should be rendered given the context.
 */
const shouldRender = (
    configuration: ToolbarItem,
    context: ToolbarItemRenderContext
) => {
    if (context === 'toolbar') {
        return configuration.isPinned;
    }

    return true;
};

interface ToolbarItemComponentProps {
    renderContext: ToolbarItemRenderContext;
    configuration: ToolbarItem;
    onPinToggle: () => void;
    /** The component to render when the `ToolbarItem` is rendered in the menu. */
    menuRender: React.ReactNode;
    /** The component to render when the `ToolbarItem` is rendered in the toolbar. */
    toolbarRender: React.ReactNode;
    tooltipTitle?: string;
    trackingId: string;
}

/**
 * All `ToolbarItem`s should compose this.
 */
const ToolbarItemComponent = React.memo(
    ({
        configuration,
        renderContext,
        menuRender,
        onPinToggle,
        toolbarRender,
        tooltipTitle,
        trackingId,
    }: ToolbarItemComponentProps) => {
        if (!shouldRender(configuration, renderContext)) {
            return null;
        }

        return (
            <>
                {renderContext === 'toolbar' ? (
                    <Dropdown
                        overlay={
                            <Menu>
                                <MenuItem
                                    icon={<SvgCloseIcon />}
                                    onClick={() => {
                                        H.track(
                                            `ToolbarMenuItemPin ${trackingId}`,
                                            {
                                                isPinned: false,
                                            }
                                        );
                                        onPinToggle();
                                    }}
                                >
                                    Unpin
                                </MenuItem>
                            </Menu>
                        }
                        trigger={['contextMenu']}
                    >
                        <Tooltip
                            title={tooltipTitle}
                            placement="topLeft"
                            arrowPointAtCenter
                        >
                            <div className={styles.toolbarItem}>
                                {toolbarRender}
                            </div>
                        </Tooltip>
                    </Dropdown>
                ) : (
                    <div className={styles.menuItemContainer}>
                        <ToggleButton
                            trackingId="pin"
                            iconButton
                            className={styles.pinButton}
                            toggled={configuration.isPinned}
                            onClick={() => {
                                H.track(`ToolbarMenuItemUPin ${trackingId}`, {
                                    isPinned: !configuration.isPinned,
                                });
                                onPinToggle();
                            }}
                        >
                            <SvgPinTackIcon />
                        </ToggleButton>
                        <Tooltip
                            title={tooltipTitle}
                            placement="topLeft"
                            arrowPointAtCenter
                        >
                            {menuRender}
                        </Tooltip>
                    </div>
                )}
            </>
        );
    }
);

export const DevToolsToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const { showDevTools, setShowDevTools } = usePlayerConfiguration();
        const { devToolsButton, setDevToolsButton } = useToolbarItemsContext();
        const { isPlayerFullscreen } = usePlayerUIContext();

        if (!shouldRender(devToolsButton, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="DevTools"
                configuration={devToolsButton}
                menuRender={
                    <Switch
                        disabled={isPlayerFullscreen}
                        label="Show DevTools"
                        className={styles.switchElement}
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={showDevTools}
                        onChange={(checked) => {
                            setShowDevTools(checked);
                        }}
                        trackingId="ToolbarDevTools"
                    />
                }
                onPinToggle={() => {
                    setDevToolsButton({ isPinned: !devToolsButton.isPinned });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <ToggleButton
                        id={`${PlayerPageProductTourSelectors.DevToolsButton}`}
                        trackingId="PlayerDevTools"
                        type="text"
                        className={styles.devToolsButton}
                        onClick={() => {
                            setShowDevTools(!showDevTools);
                        }}
                        disabled={loading || isPlayerFullscreen}
                        toggled={showDevTools}
                    >
                        <SvgDevtoolsIcon
                            className={classNames(styles.devToolsIcon, {
                                [styles.devToolsActive]: showDevTools,
                            })}
                        />
                    </ToggleButton>
                }
                tooltipTitle="View the DevTools to see console logs, errors, and network requests."
            />
        );
    }
);

export const TimelineAnnotationsToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const { setTimelineAnnotations, timelineAnnotations } =
            useToolbarItemsContext();

        if (!shouldRender(timelineAnnotations, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="TimelineAnnotations"
                configuration={timelineAnnotations}
                menuRender={
                    <div
                        key="timelineAnnotationSettings"
                        className={toolbarStyles.speedControlContainer}
                    >
                        Annotations
                        <TimelineAnnotationsSettings disabled={loading} />
                    </div>
                }
                onPinToggle={() => {
                    setTimelineAnnotations({
                        isPinned: !timelineAnnotations.isPinned,
                    });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <div>
                        <TimelineAnnotationsSettings disabled={loading} />
                    </div>
                }
            />
        );
    }
);

export const PlaybackSpeedControlToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const { playbackSpeedControl, setPlaybackSpeedControl } =
            useToolbarItemsContext();

        if (!shouldRender(playbackSpeedControl, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="PlaybackSpeedControl"
                configuration={playbackSpeedControl}
                menuRender={
                    <div
                        key="speedControl"
                        className={toolbarStyles.speedControlContainer}
                    >
                        Playback speed
                        <SpeedControl disabled={loading} />
                    </div>
                }
                onPinToggle={() => {
                    setPlaybackSpeedControl({
                        isPinned: !playbackSpeedControl.isPinned,
                    });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <div>
                        <SpeedControl disabled={loading} />
                    </div>
                }
            />
        );
    }
);

export const MouseTrailToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const {
            showMouseTrail: configuration,
            setShowMouseTrail: setConfiguration,
        } = useToolbarItemsContext();
        const { showPlayerMouseTail, setShowPlayerMouseTail } =
            usePlayerConfiguration();

        if (!shouldRender(configuration, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="MouseTrail"
                configuration={configuration}
                menuRender={
                    <Switch
                        label="Show mouse trail"
                        className={styles.switchElement}
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={showPlayerMouseTail}
                        onChange={(checked) => {
                            setShowPlayerMouseTail(checked);
                        }}
                        trackingId="ToolbarMouseTrail"
                    />
                }
                onPinToggle={() => {
                    setConfiguration({ isPinned: !configuration.isPinned });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <ToggleButton
                        id={`${PlayerPageProductTourSelectors.DevToolsButton}`}
                        trackingId="MouseTrail"
                        type="text"
                        className={styles.devToolsButton}
                        onClick={() => {
                            setShowPlayerMouseTail(!showPlayerMouseTail);
                        }}
                        disabled={loading}
                        toggled={showPlayerMouseTail}
                    >
                        <SvgMouseIcon
                            className={classNames(styles.devToolsIcon, {
                                [styles.devToolsActive]: showPlayerMouseTail,
                            })}
                        />
                    </ToggleButton>
                }
                tooltipTitle="Renders a mouse trail in the video player. This is helpful to see where the mouse has moved on the screen."
            />
        );
    }
);

export const SkipInactiveToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const {
            skipInactive: configuration,
            setSkipInactive: setConfiguration,
        } = useToolbarItemsContext();
        const { skipInactive, setSkipInactive } = usePlayerConfiguration();

        if (!shouldRender(configuration, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="SkipInactive"
                configuration={configuration}
                menuRender={
                    <Switch
                        label="Skip inactive"
                        className={styles.switchElement}
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={skipInactive}
                        onChange={(checked) => {
                            setSkipInactive(checked);
                        }}
                        trackingId="ToolbarSkipInactive"
                    />
                }
                onPinToggle={() => {
                    setConfiguration({ isPinned: !configuration.isPinned });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <ToggleButton
                        id={`${PlayerPageProductTourSelectors.DevToolsButton}`}
                        trackingId="SkipInactive"
                        type="text"
                        className={styles.devToolsButton}
                        onClick={() => {
                            setSkipInactive(!skipInactive);
                        }}
                        disabled={loading}
                        toggled={skipInactive}
                    >
                        <SvgFastForwardIcon
                            className={classNames(styles.devToolsIcon, {
                                [styles.devToolsActive]: skipInactive,
                            })}
                        />
                    </ToggleButton>
                }
                tooltipTitle="Skips playing the inactive portions of the session."
            />
        );
    }
);

export const AutoPlayToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const { autoPlay: configuration, setAutoPlay: setConfiguration } =
            useToolbarItemsContext();
        const { autoPlayVideo, setAutoPlayVideo } = usePlayerConfiguration();

        if (!shouldRender(configuration, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="AutoPlay"
                configuration={configuration}
                menuRender={
                    <Switch
                        label="Autoplay video"
                        className={styles.switchElement}
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={autoPlayVideo}
                        onChange={(checked) => {
                            setAutoPlayVideo(checked);
                        }}
                        trackingId="ToolbarAutoPlay"
                    />
                }
                onPinToggle={() => {
                    setConfiguration({ isPinned: !configuration.isPinned });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <ToggleButton
                        id={`${PlayerPageProductTourSelectors.DevToolsButton}`}
                        trackingId="AutoPlay"
                        type="text"
                        className={styles.devToolsButton}
                        onClick={() => {
                            setAutoPlayVideo(!autoPlayVideo);
                        }}
                        disabled={loading}
                        toggled={autoPlayVideo}
                    >
                        <SvgVideoIcon
                            className={classNames(styles.devToolsIcon, {
                                [styles.devToolsActive]: autoPlayVideo,
                            })}
                        />
                    </ToggleButton>
                }
                tooltipTitle="Automatically starts playing the video."
            />
        );
    }
);

export const PlayerTimeToolbarItem = React.memo(
    ({ loading, renderContext }: ToolbarItemProps) => {
        const { showPlayerAbsoluteTime, setShowPlayerAbsoluteTime } =
            usePlayerConfiguration();
        const { showPlayerTime, setShowPlayerTime } = useToolbarItemsContext();

        if (!shouldRender(showPlayerTime, renderContext)) {
            return null;
        }

        return (
            <ToolbarItemComponent
                trackingId="PlayerTime"
                configuration={showPlayerTime}
                menuRender={
                    <Switch
                        label="Show Absolute Time"
                        className={styles.switchElement}
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={showPlayerAbsoluteTime}
                        onChange={(checked) => {
                            setShowPlayerAbsoluteTime(checked);
                        }}
                        trackingId="ToolbarPlayerTime"
                    />
                }
                onPinToggle={() => {
                    setShowPlayerTime({ isPinned: !showPlayerTime.isPinned });
                }}
                renderContext={renderContext}
                toolbarRender={
                    <ToggleButton
                        id={`${PlayerPageProductTourSelectors.DevToolsButton}`}
                        trackingId="PlayerTime"
                        type="text"
                        className={styles.devToolsButton}
                        onClick={() => {
                            setShowPlayerAbsoluteTime(!showPlayerAbsoluteTime);
                        }}
                        disabled={loading}
                        toggled={showPlayerAbsoluteTime}
                    >
                        <SvgClockIcon
                            className={classNames(styles.devToolsIcon, {
                                [styles.devToolsActive]: showPlayerAbsoluteTime,
                            })}
                        />
                    </ToggleButton>
                }
                tooltipTitle="Shows timestamps in absolute time (at the time the event happened)"
            />
        );
    }
);
