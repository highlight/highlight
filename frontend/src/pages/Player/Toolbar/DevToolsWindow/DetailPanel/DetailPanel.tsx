import Button from '@components/Button/Button/Button';
import SvgArrowLeftIcon from '@icons/ArrowLeftIcon';
import { useDevToolsContext } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext';
import React from 'react';

import styles from './DetailPanel.module.scss';

const DetailPanel = () => {
    const { setPanelContent, panelContent } = useDevToolsContext();

    if (!panelContent) {
        return null;
    }

    return (
        <div className={styles.detailPanel}>
            <div className={styles.header}>
                <Button
                    trackingId="DevToolsDetailsPanel"
                    onClick={() => {
                        setPanelContent(undefined);
                    }}
                    iconButton
                    type="text"
                    className={styles.backButton}
                >
                    <SvgArrowLeftIcon />
                </Button>
                <h3>{panelContent.title}</h3>
            </div>

            <div className={styles.contentContainer}>
                {panelContent.content}
            </div>
        </div>
    );
};

export default DetailPanel;
