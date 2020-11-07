import React from 'react';

export const OpenDevToolsContext = React.createContext({
    openDevTools: true,
    setOpenDevTools: (val: boolean) => {},
});

export const IsConsoleContext = React.createContext({
    isConsole: true,
    setIsConsole: (val: boolean) => {},
});
