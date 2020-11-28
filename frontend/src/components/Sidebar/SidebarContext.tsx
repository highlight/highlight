import React from 'react';

export const SidebarContext = React.createContext<{
    openSidebar: boolean;
    setOpenSidebar: (val: boolean) => void;
}>({
    openSidebar: true,
    setOpenSidebar: (val: boolean) => {},
});
