import { createContext } from 'react';
import { Replayer } from '@highlight-run/rrweb';

export enum ReplayerState {
    NotLoaded,
    Loading,
    Loaded,
}

interface ReplayerContextInterface {
    state: ReplayerState;
    replayer: Replayer | undefined;
}

export const defaultValue: ReplayerContextInterface = {
    state: ReplayerState.Loaded,
    replayer: undefined,
};

const ReplayerContext = createContext<ReplayerContextInterface>(defaultValue);

export default ReplayerContext;
