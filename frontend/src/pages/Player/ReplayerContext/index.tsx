import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';
import { SessionInterval } from '@highlight-run/rrweb/dist/types';
import { HighlightEvent } from '../HighlightEvent';

export enum ReplayerState {
    Loading,
    /** Replayer is loaded but the user hasn't interacted with the player yet. */
    LoadedAndUntouched,
    Playing,
    Paused,
}

/**
 * The different player modes. Modes will change the type of interactions that player can support.
 */
export enum PlayerMode {
    /**
     * Normal playback mode.
     */
    Normal,
    /**
     * Allows users to inspect the DOM of the player.
     */
    Inspector,
}

export interface ParsedSessionInterval extends SessionInterval {
    startPercent: number;
    endPercent: number;
}

export interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
    /** The current time the player is at. */
    time: number;
    setTime: (newTime: number) => void;
    /** The current size of the replayer (in percent). */
    scale: number;
    play: (time?: number) => void;
    pause: (time?: number) => void;
    setScale: React.Dispatch<React.SetStateAction<number>>;
    events: Array<HighlightEvent>;
    sessionIntervals: Array<ParsedSessionInterval>;
    mode: PlayerMode;
    toggleInteractMode: () => void;
}

/* eslint-disable */
export const defaultValue: ReplayerContextInterface = {
    state: ReplayerState.Loading,
    replayer: undefined,
    scale: 1,
    setScale: (_) => {},
    time: 0,
    setTime: (_) => {},
    play: (_) => {},
    pause: (_) => {},
    events: [],
    sessionIntervals: [],
    mode: PlayerMode.Normal,
    toggleInteractMode: () => {},
};
/* eslint-enable */

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
