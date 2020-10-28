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
            <div className={styles.devToolsNav}>
                <div
                    onClick={() => setIsConsole((s) => !s)}
                    style={{
                        cursor: 'pointer',
                    }}
                    className={styles.toggleWrapper}
                >
                    <div
                        className={styles.devToolsType}
                        style={{
                            borderRadius: '8px 0px 0px 8px',
                            backgroundColor: isConsole ? 'white' : '#5629c6',
                            color: isConsole ? '#5629c6' : 'white',
                            borderRight: 'none',
                        }}
                    >
                        NETWORK
                    </div>
                    <div
                        className={styles.devToolsType}
                        style={{
                            borderRadius: '0px 8px 8px 0px',
                            backgroundColor: isConsole ? '#5629c6' : 'white',
                            color: isConsole ? 'white' : '#5629c6',
                            borderLeft: 'none',
                        }}
                    >
                        CONSOLE
                    </div>
                </div>
            </div>
            {isConsole ? (
                <ConsolePage time={time} />
            ) : (
                <ResourcePage startTime={startTime} time={time} />
            )}
        </div>
    );
};
