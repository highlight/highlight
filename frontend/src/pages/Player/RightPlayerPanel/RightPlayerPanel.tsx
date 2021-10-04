import EventStream from '@pages/Player/components/EventStream/EventStream';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils';
import DetailPanel from '@pages/Player/Toolbar/DevToolsWindow/DetailPanel/DetailPanel';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import Tabs from '../../../components/Tabs/Tabs';
import PanelToggleButton from '../components/PanelToggleButton/PanelToggleButton';
import { MetadataBox } from '../MetadataBox/MetadataBox';
import MetadataPanel from '../MetadataPanel/MetadataPanel';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import playerPageStyles from '../PlayerPage.module.scss';
import { PlayerPageProductTourSelectors } from '../PlayerPageProductTour/PlayerPageProductTour';
import { useReplayerContext } from '../ReplayerContext';
import SessionFullCommentList from '../SessionFullCommentList/SessionFullCommentList';
import styles from './RightPlayerPanel.module.scss';

const RightPlayerPanel = () => {
    const {
        showRightPanel: showRightPanelPreference,
        setShowRightPanel,
    } = usePlayerConfiguration();
    const { canViewSession } = useReplayerContext();
    const {
        detailedPanel,
        setDetailedPanel,
        setSelectedRightPanelTab,
    } = usePlayerUIContext();

    const showRightPanel = showRightPanelPreference && canViewSession;

    useEffect(() => {
        if (detailedPanel) {
            setShowRightPanel(true);
        }
    }, [detailedPanel, setShowRightPanel]);

    useEffect(() => {
        const commentId = new URLSearchParams(location.search).get(
            PlayerSearchParameters.commentId
        );

        if (commentId) {
            setShowRightPanel(true);
            setSelectedRightPanelTab('Comments');
        }
    }, [setSelectedRightPanelTab, setShowRightPanel]);

    return (
        <>
            <div
                className={classNames(styles.playerRightPanelContainer, {
                    [styles.hidden]: !showRightPanel,
                })}
            >
                <DetailPanel />
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
                        if (detailedPanel) {
                            setDetailedPanel(undefined);
                        } else {
                            setShowRightPanel(!showRightPanel);
                        }
                    }}
                />
                <div className={styles.playerRightPanelCollapsible}>
                    <MetadataBox />
                    {showRightPanel && (
                        <Tabs
                            centered
                            tabsHtmlId={`${PlayerPageProductTourSelectors.PlayerRightPanel}`}
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
