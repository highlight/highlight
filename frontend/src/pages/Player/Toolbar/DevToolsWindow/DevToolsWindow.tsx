import React, { useContext, useState } from 'react';

import { ConsolePage } from './ConsolePage/ConsolePage';
import { ResourcePage } from './ResourcePage/ResourcePage';
import {
    IsConsoleContext,
    OpenDevToolsContext,
} from '../DevToolsContext/DevToolsContext';

import styles from './DevToolsWindow.module.css';

export const DevToolsWindow = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { openDevTools } = useContext(OpenDevToolsContext);
    const [isConsole, setIsConsole] = useState(true);
    return (
        <IsConsoleContext.Provider value={{ isConsole, setIsConsole }}>
            {openDevTools ? (
                <div className={styles.devToolsWrapper}>
                    {isConsole ? (
                        <ConsolePage time={time} />
                    ) : (
                        <ResourcePage startTime={startTime} time={time} />
                    )}
                </div>
            ) : (
                <></>
            )}
        </IsConsoleContext.Provider>
    );
};
