import React from 'react';

export const SidebarContext = React.createContext<{
    openSidebar: boolean;
    setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    openSidebar: true,
    /* eslint-disable */
    setOpenSidebar: (_) => {},
    /* eslint-enable */
});
