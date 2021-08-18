import { H } from 'highlight.run';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ReplayerState, useReplayerContext } from '../ReplayerContext';

/**
 * The time to skip along the timeline. Used to skip X time back or forwards.
 */
const SKIP_DURATION = 5000;

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
            return Math.max(time - SKIP_DURATION, 0);
        case 'forwards':
            if (!!totalTime) {
                return Math.min(time + SKIP_DURATION, totalTime);
            }
            return time;
        default:
            return time;
    }
};

export const usePlayerHotKeys = () => {
    const { state, play, pause, time, replayer } = useReplayerContext();

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
