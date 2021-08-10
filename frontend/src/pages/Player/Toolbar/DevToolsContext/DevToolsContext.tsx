import { createContext } from '../../../../util/context/context';

export enum DevToolTabs {
    Console,
    Network,
    Errors,
}

interface DevToolsContext {
    openDevTools: boolean;
    setOpenDevTools: (val: boolean) => void;
    selectedTab: DevToolTabs;
    setSelectedTab: (tab: DevToolTabs) => void;
}

export const [
    useDevToolsContext,
    DevToolsContextProvider,
] = createContext<DevToolsContext>('DevTools');
