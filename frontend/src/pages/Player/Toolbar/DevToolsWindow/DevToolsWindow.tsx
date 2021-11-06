import React from 'react';
import ResizePanel from 'react-resize-panel-ts';

import Tabs, { TabItem } from '../../../../components/Tabs/Tabs';
import SvgXIcon from '../../../../static/XIcon';
import { usePlayerUIContext } from '../../context/PlayerUIContext';
import DOMInteractionsToggle from '../../DOMInteractionsToggle/DOMInteractionsToggle';
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext';
import { ConsolePage } from './ConsolePage/ConsolePage';
import styles from './DevToolsWindow.module.scss';
import ErrorsPage from './ErrorsPage/ErrorsPage';
import { ResourcePage } from './ResourcePage/ResourcePage';

export const DevToolsWindow = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { openDevTools, setOpenDevTools } = useDevToolsContext();
    const { isPlayerFullscreen } = usePlayerUIContext();

    const TABS: TabItem[] = [
        {
            key: 'Errors',
            panelContent: <ErrorsPage />,
        },
        {
            key: 'Console',
            panelContent: <ConsolePage time={time} />,
        },
        {
            key: 'Network',
            panelContent: <ResourcePage startTime={startTime} time={time} />,
        },
    ];

    if (!openDevTools || isPlayerFullscreen) {
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
                <Tabs
                    tabs={TABS}
                    id="DevTools"
                    noPadding
                    className={styles.tabs}
                    tabBarExtraContent={
                        <>
                            <DOMInteractionsToggle />
                            <SvgXIcon
                                className={styles.closeStyle}
                                onClick={() => setOpenDevTools(false)}
                            />
                        </>
                    }
                />
            </div>
        </ResizePanel>
    );
};
