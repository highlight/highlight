import React from 'react';
import ResizePanel from 'react-resize-panel-ts';

import { ConsolePage } from './ConsolePage/ConsolePage';
import { ResourcePage } from './ResourcePage/ResourcePage';
import {
    DevToolTabs,
    useDevToolsContext,
} from '../DevToolsContext/DevToolsContext';

import styles from './DevToolsWindow.module.scss';
import ErrorsPage from './ErrorsPage/ErrorsPage';
import { DevToolsSelect } from './Option/Option';

export const DevToolsWindow = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { openDevTools, selectedTab } = useDevToolsContext();

    const getPage = (tab: DevToolTabs) => {
        switch (tab) {
            case DevToolTabs.Errors:
                return <ErrorsPage />;
            case DevToolTabs.Network:
                return <ResourcePage startTime={startTime} time={time} />;
            case DevToolTabs.Console:
            default:
                return <ConsolePage time={time} />;
        }
    };

    if (!openDevTools) {
        return null;
    }

    return (
        <ResizePanel
            direction="n"
            containerClass={styles.resizeContainer}
            handleClass={styles.resizeHandle}
            borderClass={styles.resizeBorder}
        >
            <div className={styles.devToolsWrapper}>
                <DevToolsSelect />
                {getPage(selectedTab)}
            </div>
        </ResizePanel>
    );
};
