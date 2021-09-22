import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import {
    changeSession,
    findNextSessionInList,
    findPreviousSessionInList,
} from '@pages/Player/PlayerHook/utils';
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration';
import {
    PLAYBACK_MAX_SPEED,
    PLAYBACK_MIN_SPEED,
    PLAYBACK_SPEED_INCREMENT,
} from '@pages/Player/Toolbar/SpeedControl/SpeedControl';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import { H } from 'highlight.run';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useHistory } from 'react-router-dom';

import { ReplayerState, useReplayerContext } from '../ReplayerContext';

/**
 * The time to skip along the timeline. Used to skip X time back or forwards.
 */
export const PLAYER_SKIP_DURATION = 5000;

export const getNewTimeWithSkip = ({
    direction,
    time,
    totalTime,
}: {
    time: number;
    totalTime?: number;
    direction: 'backwards' | 'forwards';
}) => {
    switch (direction) {
        case 'backwards':
            return Math.max(time - PLAYER_SKIP_DURATION, 0);
        case 'forwards':
            if (!!totalTime) {
                return Math.min(time + PLAYER_SKIP_DURATION, totalTime);
            }
            return time;
        default:
            return time;
    }
};

export const usePlayerKeyboardShortcuts = () => {
    const {
        state,
        play,
        pause,
        time,
        replayer,
        sessionResults,
    } = useReplayerContext();
    const { setIsPlayerFullscreen } = usePlayerUIContext();
    const {
        setPlayerSpeed,
        playerSpeed,
        setEnableInspectElement,
        setShowLeftPanel,
        showLeftPanel,
        showRightPanel,
        setShowRightPanel,
    } = usePlayerConfiguration();
    const { session_id, project_id } = useParams<{
        session_id: string;
        project_id: string;
    }>();
    const history = useHistory();
    message.config({
        maxCount: 1,
        rtl: false,
    });

    /**
     * This function needs to be called before each hot key.
     * This moves the window's focus from any interactable elements to the window.
     * Without this, undefined behavior will occur.
     * Example: If the user clicks a button, then presses space, space will trigger the default action on the button and also the space hotkey.
     */
    const moveFocusToDocument = (e: KeyboardEvent) => {
        e.stopPropagation();
        e.preventDefault();
        window.focus();

        if (
            document.activeElement &&
            document.activeElement instanceof HTMLElement
        ) {
            document.activeElement.blur();
        }
    };

    useHotkeys(
        'space',
        (e) => {
            if (replayer) {
                H.track('PlayerPausePlayKeyboardShortcut');
                moveFocusToDocument(e);

                switch (state) {
                    case ReplayerState.Playing:
                        pause(time);
                        break;
                    case ReplayerState.Paused:
                    case ReplayerState.LoadedAndUntouched:
                    case ReplayerState.LoadedWithDeepLink:
                        play(time);
                        break;
                    case ReplayerState.Loading:
                    case ReplayerState.SessionRecordingStopped:
                        break;
                }
            }
        },
        [state, time, pause, play]
    );

    useHotkeys(
        'left',
        (e) => {
            if (replayer) {
                H.track('PlayerSkipBackwardsKeyboardShortcut');
                moveFocusToDocument(e);

                const newTime = getNewTimeWithSkip({
                    time,
                    direction: 'backwards',
                });

                switch (state) {
                    case ReplayerState.Playing:
                        play(newTime);
                        break;
                    case ReplayerState.Paused:
                    case ReplayerState.LoadedAndUntouched:
                    case ReplayerState.LoadedWithDeepLink:
                        pause(newTime);
                        break;
                    case ReplayerState.Loading:
                    case ReplayerState.SessionRecordingStopped:
                        break;
                }
            }
        },
        [time, state, pause, play]
    );

    useHotkeys(
        'right',
        (e) => {
            if (replayer) {
                H.track('PlayerSkipForwardsKeyboardShortcut');
                moveFocusToDocument(e);

                const totalTime = replayer?.getMetaData().totalTime;
                const newTime = getNewTimeWithSkip({
                    time,
                    direction: 'forwards',
                    totalTime,
                });

                switch (state) {
                    case ReplayerState.Playing:
                        play(newTime);
                        break;
                    case ReplayerState.Paused:
                    case ReplayerState.LoadedAndUntouched:
                    case ReplayerState.LoadedWithDeepLink:
                        pause(newTime);
                        break;
                    case ReplayerState.Loading:
                    case ReplayerState.SessionRecordingStopped:
                        break;
                }
            }
        },
        [time, replayer, state, pause, play]
    );

    useHotkeys(
        'shift+n',
        (e) => {
            if (sessionResults.sessions.length > 0 && session_id) {
                H.track('PlayerSkipToNextSessionKeyboardShortcut');
                moveFocusToDocument(e);

                const nextSession = findNextSessionInList(
                    sessionResults.sessions,
                    session_id
                );
                changeSession(project_id, history, nextSession);
            }
        },
        [session_id, sessionResults]
    );

    useHotkeys(
        'shift+p',
        (e) => {
            if (sessionResults.sessions.length > 0 && session_id) {
                H.track('PlayerSkipToPreviousSessionKeyboardShortcut');
                moveFocusToDocument(e);

                const nextSession = findPreviousSessionInList(
                    sessionResults.sessions,
                    session_id
                );
                changeSession(
                    project_id,
                    history,
                    nextSession,
                    'Playing the previous session.'
                );
            }
        },
        [session_id, sessionResults]
    );

    useHotkeys(
        'shift+.',
        (e) => {
            H.track('PlayerIncreasePlayerSpeedKeyboardShortcut');
            moveFocusToDocument(e);

            if (playerSpeed === PLAYBACK_MAX_SPEED) {
                message.success(
                    `Playback speed is already at the max: ${PLAYBACK_MAX_SPEED}x`
                );
                return;
            }

            const newSpeed = playerSpeed + PLAYBACK_SPEED_INCREMENT;
            setPlayerSpeed(newSpeed);

            message.success(`Playback speed set to ${newSpeed.toFixed(1)}x`);
        },
        [playerSpeed]
    );

    useHotkeys(
        'shift+,',
        (e) => {
            H.track('PlayerDecreasePlayerSpeedKeyboardShortcut');
            moveFocusToDocument(e);

            if (playerSpeed === PLAYBACK_MIN_SPEED) {
                message.success(
                    `Playback speed is already at the minimum: ${PLAYBACK_MIN_SPEED}x`
                );
                return;
            }

            const newSpeed = playerSpeed - PLAYBACK_SPEED_INCREMENT;
            setPlayerSpeed(newSpeed);

            message.success(`Playback speed set to ${newSpeed.toFixed(1)}x`);
        },
        [playerSpeed]
    );

    useHotkeys(
        'f',
        (e) => {
            if (replayer) {
                H.track('PlayerToggleFullscreenKeyboardShortcut');
                moveFocusToDocument(e);

                setIsPlayerFullscreen((previousState) => !previousState);
            }
        },
        [replayer]
    );

    useHotkeys('c', (e) => {
        H.track('PlayerEnableCommentsKeyboardShortcut');
        moveFocusToDocument(e);

        setEnableInspectElement(false);
        message.success(
            'Commenting enabled, click anywhere on the video to create a comment.'
        );
    });

    useHotkeys('d', (e) => {
        H.track('PlayerEnableInspectElementKeyboardShortcut');
        moveFocusToDocument(e);

        setEnableInspectElement(true);
        message.success(
            "Inspect element enabled, you can open up your browser's DevTools and inspect the DOM now."
        );
    });

    useHotkeys(
        'cmd+b, ctrl+b',
        (e) => {
            H.track('PlayerToggleLeftSidebarKeyboardShortcut');
            moveFocusToDocument(e);

            setShowLeftPanel(!showLeftPanel);
        },
        [showLeftPanel]
    );

    useHotkeys(
        'cmd+i, ctrl+i',
        (e) => {
            H.track('PlayerToggleRightSidebarKeyboardShortcut');
            moveFocusToDocument(e);

            setShowRightPanel(!showRightPanel);
        },
        [showRightPanel]
    );
};

export const usePlayerFullscreen = () => {
    const playerCenterPanelRef = useRef<HTMLDivElement>(null);
    const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);

    useEffect(() => {
        document.onfullscreenchange = () => {
            if (!document.fullscreenElement) {
                setIsPlayerFullscreen(false);
            }
        };
    }, []);

    useEffect(() => {
        if (playerCenterPanelRef.current) {
            if (isPlayerFullscreen) {
                playerCenterPanelRef.current.requestFullscreen();
            } else if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }, [isPlayerFullscreen]);

    return {
        playerCenterPanelRef,
        isPlayerFullscreen,
        setIsPlayerFullscreen,
    };
};
