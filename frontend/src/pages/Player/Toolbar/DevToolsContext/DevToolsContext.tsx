import { createContext } from '../../../../util/context/context';

export enum DevToolTabs {
    Console,
    Network,
    Errors,
}

interface DevToolsContext {
    openDevTools: boolean;
    setOpenDevTools: (val: boolean) => void;
}

export const [
    useDevToolsContext,
    DevToolsContextProvider,
] = createContext<DevToolsContext>('DevTools');
