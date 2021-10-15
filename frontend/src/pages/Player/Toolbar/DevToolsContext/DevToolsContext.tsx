import { createContext } from '../../../../util/context/context';

interface DevToolsContext {
    openDevTools: boolean;
    setOpenDevTools: (val: boolean) => void;
    devToolsTab: 'Errors' | 'Console' | 'Network';
    setDevToolsTab: (val: 'Errors' | 'Console' | 'Network') => void;
}

export const [
    useDevToolsContext,
    DevToolsContextProvider,
] = createContext<DevToolsContext>('DevTools');
