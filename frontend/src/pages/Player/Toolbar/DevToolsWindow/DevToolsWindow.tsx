import React from 'react';
import ResizePanel from 'react-resize-panel-ts';

import { ConsolePage } from './ConsolePage/ConsolePage';
import { ResourcePage } from './ResourcePage/ResourcePage';
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext';

import styles from './DevToolsWindow.module.scss';
import ErrorsPage from './ErrorsPage/ErrorsPage';
import Tabs, { TabItem } from '../../../../components/Tabs/Tabs';
import SvgCloseIcon from '../../../../static/CloseIcon';
import DOMInteractionsToggle from '../../DOMInteractionsToggle/DOMInteractionsToggle';

export const DevToolsWindow = ({
    time,
    startTime,
}: {
    time: number;
    startTime: number;
}) => {
    const { openDevTools, setOpenDevTools } = useDevToolsContext();

    const TABS: TabItem[] = [
        {
            title: 'Errors',
            panelContent: <ErrorsPage />,
        },
        {
            title: 'Console',
            panelContent: <ConsolePage time={time} />,
        },
        {
            title: 'Network',
            panelContent: <ResourcePage startTime={startTime} time={time} />,
        },
    ];

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
                <Tabs
                    tabs={TABS}
                    id="DevTools"
                    noPadding
                    tabBarExtraContent={
                        <>
                            <DOMInteractionsToggle />
                            <SvgCloseIcon
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
