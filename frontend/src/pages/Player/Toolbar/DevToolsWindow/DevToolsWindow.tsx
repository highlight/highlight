import React, { useState } from 'react';

import { ConsolePage } from './ConsolePage/ConsolePage';
import { ResourcePage } from './ResourcePage/ResourcePage';

import styles from './DevToolsWindow.module.css';

export const DevToolsWindow = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const [isConsole, setIsConsole] = useState(true);
    return (
        <div className={styles.devToolsWrapper}>
            {isConsole ? (
                <ConsolePage
                    time={time}
                    onSwitchPage={() => setIsConsole(false)}
                />
            ) : (
                <ResourcePage
                    startTime={startTime}
                    time={time}
                    onSwitchPage={() => setIsConsole(true)}
                />
            )}
        </div>
    );
};
