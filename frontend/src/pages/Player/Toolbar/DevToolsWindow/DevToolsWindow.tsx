import DetailPanel from '@pages/Player/Toolbar/DevToolsWindow/DetailPanel/DetailPanel';
import React, { useEffect } from 'react';
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
    const {
        openDevTools,
        setOpenDevTools,
        setPanelContent,
    } = useDevToolsContext();
    const { isPlayerFullscreen } = usePlayerUIContext();

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

    useEffect(() => {
        if (!openDevTools) {
            setPanelContent(undefined);
        }
    }, [openDevTools, setPanelContent]);

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
                <DetailPanel />
                <Tabs
                    tabs={TABS}
                    id="DevTools"
                    noPadding
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
