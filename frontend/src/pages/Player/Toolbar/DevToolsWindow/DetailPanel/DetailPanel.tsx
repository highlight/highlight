import GoToButton from '@components/Button/GoToButton';
import Tabs from '@components/Tabs/Tabs';
import PanelToggleButton from '@pages/Player/components/PanelToggleButton/PanelToggleButton';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import ErrorModal from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import { getNetworkResourcesDisplayName } from '@pages/Player/Toolbar/DevToolsWindow/Option/Option';
import ResourceDetailsModal from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/ResourceDetailsModal/ResourceDetailsModal';
import { MillisToMinutesAndSeconds } from '@util/time';
import { message } from 'antd';
import classNames from 'classnames';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { Resizable } from 're-resizable';
import React from 'react';

import styles from './DetailPanel.module.scss';

const DetailPanel = () => {
    const { detailedPanel, setDetailedPanel } = usePlayerUIContext();
    const { session, pause, replayer } = useReplayerContext();

    return (
        <AnimatePresence presenceAffectsLayout>
            {!detailedPanel ? null : (
                <Resizable
                    enable={{ left: true }}
                    className={styles.resizeContainer}
                    defaultSize={{
                        width: '350',
                        height: 'fit-content',
                    }}
                    minWidth="300"
                    maxWidth="90vw"
                    handleComponent={{
                        left: <DragHandle />,
                    }}
                    handleWrapperClass={classNames(styles.dragHandleWrapper)}
                >
                    <motion.div
                        key="detailPanel"
                        className={styles.detailPanel}
                        initial={{ transform: 'translateX(110%)' }}
                        animate={{ transform: 'translateX(0%)' }}
                        exit={{ transform: 'translateX(110%)' }}
                    >
                        <PanelToggleButton
                            className={classNames(styles.toggleButton)}
                            direction="right"
                            isOpen={true}
                            onClick={() => {
                                setDetailedPanel(undefined);
                            }}
                        />
                        <div className={styles.contentContainer}>
                            {
                                <Tabs
                                    noPadding
                                    noHeaderPadding
                                    tabs={[
                                        ...(detailedPanel.resource
                                            ? [
                                                  {
                                                      title: 'Network Resource',
                                                      panelContent: (
                                                          <>
                                                              <div
                                                                  className={
                                                                      styles.detailPanelTitle
                                                                  }
                                                              ></div>
                                                              <div
                                                                  className={
                                                                      styles.tabContainer
                                                                  }
                                                              >
                                                                  <ResourceDetailsModal
                                                                      selectedNetworkResource={
                                                                          detailedPanel.resource
                                                                      }
                                                                      networkRecordingEnabledForSession={
                                                                          session?.enable_recording_network_contents ||
                                                                          false
                                                                      }
                                                                  />
                                                              </div>
                                                          </>
                                                      ),
                                                  },
                                              ]
                                            : []),
                                        ...(detailedPanel.error
                                            ? [
                                                  {
                                                      title: 'Error',
                                                      titleContent: (
                                                          <div>
                                                              Error
                                                              {detailedPanel.resource ? (
                                                                  <div
                                                                      className={
                                                                          styles.errorNotification
                                                                      }
                                                                  >
                                                                      <div>
                                                                          1
                                                                      </div>
                                                                  </div>
                                                              ) : null}
                                                          </div>
                                                      ),
                                                      panelContent: (
                                                          <div
                                                              className={
                                                                  styles.tabContainer
                                                              }
                                                          >
                                                              <ErrorModal
                                                                  error={
                                                                      detailedPanel.error
                                                                  }
                                                              />
                                                          </div>
                                                      ),
                                                  },
                                              ]
                                            : []),
                                    ]}
                                    tabBarExtraContent={
                                        <div
                                            className={
                                                styles.extraContentContainer
                                            }
                                        >
                                            <GoToButton
                                                onClick={() => {
                                                    if (
                                                        detailedPanel.resource
                                                    ) {
                                                        pause(
                                                            detailedPanel
                                                                .resource
                                                                .startTime
                                                        );

                                                        message.success(
                                                            `Changed player time to when ${getNetworkResourcesDisplayName(
                                                                detailedPanel
                                                                    .resource
                                                                    .initiatorType
                                                            )} request started at ${MillisToMinutesAndSeconds(
                                                                detailedPanel
                                                                    .resource
                                                                    .startTime
                                                            )}.`
                                                        );
                                                    } else if (
                                                        detailedPanel.error
                                                    ) {
                                                        const sessionTotalTime = replayer?.getMetaData()
                                                            .totalTime;
                                                        const sessionStartTime =
                                                            replayer?.getMetaData()
                                                                .startTime || 0;

                                                        const relativeTime =
                                                            new Date(
                                                                detailedPanel.error.timestamp
                                                            ).getTime() -
                                                            sessionStartTime;

                                                        if (
                                                            sessionTotalTime !==
                                                                undefined &&
                                                            relativeTime >= 0 &&
                                                            relativeTime <=
                                                                sessionTotalTime
                                                        ) {
                                                            pause(relativeTime);

                                                            message.success(
                                                                `Changed player time to when error occurred at ${MillisToMinutesAndSeconds(
                                                                    relativeTime
                                                                )}.`
                                                            );
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    }
                                    id={`${
                                        detailedPanel.resource ? 'Network' : ''
                                    }${
                                        detailedPanel.error ? 'Error' : ''
                                    }RightPanelTabs`}
                                />
                            }
                        </div>
                    </motion.div>
                </Resizable>
            )}
        </AnimatePresence>
    );
};

export default DetailPanel;

const DragHandle = () => {
    const isPresent = useIsPresent();

    return (
        <div
            className={classNames(styles.dragHandle, {
                [styles.hidden]: !isPresent,
            })}
        ></div>
    );
};
