import { useContext } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import ReplayerContext, { ReplayerState } from '../ReplayerContext';

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
    const { state, play, pause, time, replayer } = useContext(ReplayerContext);

    useHotkeys(
        'space',
        () => {
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
        },
        [state, time]
    );

    useHotkeys(
        'left',
        () => {
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
        },
        [time]
    );

    useHotkeys(
        'right',
        () => {
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
        },
        [time, replayer]
    );
};
