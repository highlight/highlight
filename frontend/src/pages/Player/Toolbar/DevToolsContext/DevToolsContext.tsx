import { createContext } from '../../../../util/context/context';

interface DevToolsContext {
    openDevTools: boolean;
    setOpenDevTools: (val: boolean) => void;
}

export const [
    useDevToolsContext,
    DevToolsContextProvider,
] = createContext<DevToolsContext>('DevTools');
