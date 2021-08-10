import React from 'react';

import Tabs from '../../../components/Tabs/Tabs';
import { MetadataBox } from '../MetadataBox/MetadataBox';
import MetadataPanel from '../MetadataPanel/MetadataPanel';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import { EventStream } from '../PlayerPage';
import { useReplayerContext } from '../ReplayerContext';
import SessionFullCommentList from '../SessionFullCommentList/SessionFullCommentList';
import styles from './RightPlayerPanel.module.scss';

const RightPlayerPanel = () => {
    const {
        showRightPanel: showRightPanelPreference,
    } = usePlayerConfiguration();
    const { canViewSession } = useReplayerContext();

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
                    className={styles.tabs}
                    tabs={[
                        {
                            title: 'Events',
                            panelContent: <EventStream />,
                        },
                        {
                            title: 'Comments',
                            panelContent: (
                                <div className={styles.tabContentContainer}>
                                    <SessionFullCommentList />
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
