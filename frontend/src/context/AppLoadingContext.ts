import { createContext } from '@util/context/context';

export enum AppLoadingState {
    LOADING,
    EXTENDED_LOADING,
    LOADED,
}
interface AppLoadingContext {
    setLoadingState: React.Dispatch<React.SetStateAction<AppLoadingState>>;
    loadingState: AppLoadingState;
}

export const [
    useAppLoadingContext,
    AppLoadingContext,
] = createContext<AppLoadingContext>('AppLoadingContext');
