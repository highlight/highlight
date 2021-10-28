import { createContext } from '@util/context/context';

interface AppLoadingContext {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
}

export const [
    useAppLoadingContext,
    AppLoadingContext,
] = createContext<AppLoadingContext>('AppLoadingContext');
