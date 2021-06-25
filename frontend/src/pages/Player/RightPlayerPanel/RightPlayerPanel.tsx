import useLocalStorage from '@rehooks/local-storage';
import React, { useContext } from 'react';

import Tabs from '../../../components/Tabs/Tabs';
import CommentStream from '../CommentStream/CommentStream';
import { MetadataBox } from '../MetadataBox/MetadataBox';
import MetadataPanel from '../MetadataPanel/MetadataPanel';
import { EventStream } from '../PlayerPage';
import ReplayerContext from '../ReplayerContext';
import styles from './RightPlayerPanel.module.scss';

const RightPlayerPanel = () => {
    const [showRightPanelPreference] = useLocalStorage(
        'highlightMenuShowRightPanel',
        true
    );
    const { canViewSession } = useContext(ReplayerContext);

    const showRightPanel = showRightPanelPreference && canViewSession;

    if (!showRightPanel) {
        return null;
    }

    return (
        <div className={styles.playerRightPanelContainer}>
            <div className={styles.playerRightPanelCollapsible}>
                <MetadataBox />
                <Tabs
                    centered
                    id="PlayerRightPanel"
                    noPadding
                    tabs={[
                        {
                            title: 'Events',
                            panelContent: <EventStream />,
                        },
                        {
                            title: 'Comments',
                            panelContent: (
                                <div className={styles.tabContentContainer}>
                                    <CommentStream />
                                </div>
                            ),
                        },
                        {
                            title: 'Metadata',
                            panelContent: (
                                <div className={styles.tabContentContainer}>
                                    <MetadataPanel />
                                </div>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default RightPlayerPanel;
