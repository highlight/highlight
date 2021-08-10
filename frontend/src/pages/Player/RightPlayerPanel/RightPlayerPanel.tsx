import classNames from 'classnames';
import React from 'react';

import Tabs from '../../../components/Tabs/Tabs';
import PanelToggleButton from '../components/PanelToggleButton/PanelToggleButton';
import { MetadataBox } from '../MetadataBox/MetadataBox';
import MetadataPanel from '../MetadataPanel/MetadataPanel';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import { EventStream } from '../PlayerPage';
import playerPageStyles from '../PlayerPage.module.scss';
import { useReplayerContext } from '../ReplayerContext';
import SessionFullCommentList from '../SessionFullCommentList/SessionFullCommentList';
import styles from './RightPlayerPanel.module.scss';

const RightPlayerPanel = () => {
    const {
        showRightPanel: showRightPanelPreference,
        setShowRightPanel,
    } = usePlayerConfiguration();
    const { canViewSession } = useReplayerContext();

    const showRightPanel = showRightPanelPreference && canViewSession;

    return (
        <>
            <div
                className={classNames(styles.playerRightPanelContainer, {
                    [styles.hidden]: !showRightPanel,
                })}
            >
                <PanelToggleButton
                    className={classNames(
                        playerPageStyles.panelToggleButton,
                        playerPageStyles.panelToggleButtonRight,
                        {
                            [playerPageStyles.panelShown]: showRightPanel,
                        }
                    )}
                    direction="right"
                    isOpen={showRightPanel}
                    onClick={() => {
                        setShowRightPanel(!showRightPanel);
                    }}
                />
                <div className={styles.playerRightPanelCollapsible}>
                    <MetadataBox />
                    {showRightPanel && (
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
                                        <div
                                            className={
                                                styles.tabContentContainer
                                            }
                                        >
                                            <SessionFullCommentList />
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Metadata',
                                    panelContent: (
                                        <div
                                            className={
                                                styles.tabContentContainer
                                            }
                                        >
                                            <MetadataPanel />
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default RightPlayerPanel;
