import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';

export enum ReplayerState {
    Loading,
    Playing,
    Paused,
}

interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
    /** The current time the player is at. */
    time: number;
    setTime: (newTime: number) => void;
    /** The current size of the replayer (in percent). */
    scale: number;
    setScale: (newScale: number) => void;
    play: (time?: number) => void;
    pause: (time?: number) => void;
}

export const defaultValue: ReplayerContextInterface = {
    state: ReplayerState.Loading,
    replayer: undefined,
    scale: 1,
    setScale: (_) => {},
    time: 0,
    setTime: (_) => {},
    play: (_) => {},
    pause: (_) => {},
};

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
