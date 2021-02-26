import React from 'react';

export const OpenDevToolsContext = React.createContext({
    openDevTools: true,
    /* eslint-disable */
    setOpenDevTools: (val: boolean) => {},
    /* eslint-enable */
});

export const IsConsoleContext = React.createContext({
    isConsole: true,
    /* eslint-disable */
    setIsConsole: (val: boolean) => {},
    /* eslint-enable */
});
