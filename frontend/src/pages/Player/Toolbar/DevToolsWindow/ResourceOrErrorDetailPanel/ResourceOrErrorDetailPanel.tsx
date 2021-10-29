import GoToButton from '@components/Button/GoToButton';
import Tabs from '@components/Tabs/Tabs';
import { ErrorObject } from '@graph/schemas';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { useReplayerContext } from '@pages/Player/ReplayerContext';
import ErrorModal from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal';
import { getNetworkResourcesDisplayName } from '@pages/Player/Toolbar/DevToolsWindow/Option/Option';
import ResourceDetailsModal from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/ResourceDetailsModal/ResourceDetailsModal';
import { NetworkResource } from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/ResourcePage';
import { MillisToMinutesAndSeconds } from '@util/time';
import { message } from 'antd';
import React, { useCallback } from 'react';

import styles from './ResourceOrErrorDetailPanel.module.scss';

export const useResourceOrErrorDetailPanel = () => {
    const { pause, session, replayer } = useReplayerContext();
    const { setDetailedPanel } = usePlayerUIContext();

    const callback = (resource?: NetworkResource, error?: ErrorObject) => {
        const options = {
            title: null,
            content: (
                <Tabs
                    className={styles.tabsWrapper}
                    noPadding
                    noHeaderPadding
                    tabs={[
                        ...(resource
                            ? [
                                  {
                                      key: 'Network Resource',
                                      panelContent: (
                                          <div>
                                              <ResourceDetailsModal
                                                  selectedNetworkResource={
                                                      resource
                                                  }
                                                  networkRecordingEnabledForSession={
                                                      session?.enable_recording_network_contents ||
                                                      false
                                                  }
                                              />
                                          </div>
                                      ),
                                  },
                              ]
                            : []),
                        ...(error
                            ? [
                                  {
                                      key: 'Error',
                                      title: (
                                          <div>
                                              Error
                                              {resource ? (
                                                  <div
                                                      className={
                                                          styles.errorNotification
                                                      }
                                                  >
                                                      <div
                                                          className={
                                                              styles.errorCount
                                                          }
                                                      >
                                                          1
                                                      </div>
                                                  </div>
                                              ) : null}
                                          </div>
                                      ),
                                      panelContent: (
                                          <div>
                                              <ErrorModal error={error} />
                                          </div>
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                    tabBarExtraContent={
                        <div className={styles.extraContentContainer}>
                            <GoToButton
                                onClick={() => {
                                    if (resource) {
                                        pause(resource.startTime);

                                        message.success(
                                            `Changed player time to when ${getNetworkResourcesDisplayName(
                                                resource.initiatorType
                                            )} request started at ${MillisToMinutesAndSeconds(
                                                resource.startTime
                                            )}.`
                                        );
                                    } else if (error) {
                                        const sessionTotalTime = replayer?.getMetaData()
                                            .totalTime;
                                        const sessionStartTime =
                                            replayer?.getMetaData().startTime ||
                                            0;

                                        const relativeTime =
                                            new Date(
                                                error.timestamp
                                            ).getTime() - sessionStartTime;

                                        if (
                                            sessionTotalTime !== undefined &&
                                            relativeTime >= 0 &&
                                            relativeTime <= sessionTotalTime
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
                    id={`${resource ? 'Network' : ''}${
                        error ? 'Error' : ''
                    }RightPanelTabs`}
                />
            ),
            options: {
                noHeader: true,
                noPadding: true,
            },
            id: (resource ?? error)?.id.toString() || '',
        };

        setDetailedPanel(options);
    };

    return useCallback(callback, [
        pause,
        replayer,
        session?.enable_recording_network_contents,
        setDetailedPanel,
    ]);
};
