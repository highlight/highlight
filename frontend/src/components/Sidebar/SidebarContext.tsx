import React from 'react';

import { createContext } from '../../util/context/context';

export enum SidebarState {
    Collapsed,
    Expanded,
}
interface SidebarContext {
    state: SidebarState;
    setState: React.Dispatch<React.SetStateAction<SidebarState>>;
    toggleSidebar: () => void;
    staticSidebarState: SidebarState;
}

export const [
    useSidebarContext,
    SidebarContextProvider,
] = createContext<SidebarContext>('SidebarContext');
