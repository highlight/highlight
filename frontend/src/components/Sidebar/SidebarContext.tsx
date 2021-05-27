import React from 'react';

import { createContext } from '../../util/context/context';

export enum SidebarState {
    /** The user has explicitly collapsed the sidebar. */
    Collapsed,
    /** The user has explicitly expanded the sidebar. */
    Expanded,
}
interface SidebarContext {
    state: SidebarState;
    setState: React.Dispatch<React.SetStateAction<SidebarState>>;
    toggleSidebar: () => void;
}

export const [
    useSidebarContext,
    SidebarContextProvider,
] = createContext<SidebarContext>('SidebarContext');
