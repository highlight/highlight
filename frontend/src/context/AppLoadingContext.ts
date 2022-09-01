import { createContext } from '@util/context/context'

export enum AppLoadingState {
	LOADING,
	/** Used instead of `LOADING` if we want to show the loading screen for longer. */
	EXTENDED_LOADING,
	LOADED,
}
interface AppLoadingContext {
	setLoadingState: React.Dispatch<React.SetStateAction<AppLoadingState>>
	loadingState: AppLoadingState
}

export const [useAppLoadingContext, AppLoadingContext] =
	createContext<AppLoadingContext>('AppLoadingContext')
