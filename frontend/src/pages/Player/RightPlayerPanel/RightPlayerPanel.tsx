import EventStream from '@pages/Player/components/EventStream/EventStream';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils';
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext';
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

const RightPlayerPanel = React.memo(() => {
    const {
        showRightPanel: showRightPanelPreference,
        setShowRightPanel,
    } = usePlayerConfiguration();
    const { showBanner } = useGlobalContext();
    const { canViewSession } = useReplayerContext();
    const { setSelectedRightPanelTab, detailedPanel } = usePlayerUIContext();

    const showRightPanel = showRightPanelPreference && canViewSession;

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
                <PanelToggleButton
                    className={classNames(
                        playerPageStyles.panelToggleButton,
                        playerPageStyles.panelToggleButtonRight,
                        {
                            [playerPageStyles.panelShown]: showRightPanel,
                            [styles.toggleButtonHidden]: !!detailedPanel,
                        }
                    )}
                    direction="right"
                    isOpen={showRightPanel}
                    onClick={() => {
                        setShowRightPanel(!showRightPanel);
                    }}
                />
                {showRightPanel && (
                    <div
                        className={classNames(
                            styles.playerRightPanelCollapsible,
                            {
                                [styles.bannerShown]: showBanner,
                            }
                        )}
                    >
                        <MetadataBox />
                        <RightPlayerPanelTabs />
                    </div>
                )}
            </div>
        </>
    );
});

export default RightPlayerPanel;

const RightPlayerPanelTabs = React.memo(() => {
    return (
        <Tabs
            centered
            tabsHtmlId={`${PlayerPageProductTourSelectors.PlayerRightPanel}`}
            id="PlayerRightPanel"
            noPadding
            className={styles.tabs}
            tabs={[
                {
                    key: 'Events',
                    panelContent: <EventStream />,
                },
                {
                    key: 'Comments',
                    panelContent: (
                        <div className={styles.tabContentContainer}>
                            <SessionFullCommentList />
                        </div>
                    ),
                },
                {
                    key: 'Metadata',
                    panelContent: (
                        <div className={styles.tabContentContainer}>
                            <MetadataPanel />
                        </div>
                    ),
                },
            ]}
        />
    );
});
