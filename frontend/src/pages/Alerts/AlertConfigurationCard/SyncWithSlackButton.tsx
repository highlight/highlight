import Button from '@components/Button/Button/Button';
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useSyncSlackIntegrationMutation } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './SyncWithSlackButton.module.scss';

interface Props {
    slackUrl: string;
    isSlackIntegrated: boolean;
    refetchQueries: string[];
}

const SyncWithSlackButton = ({
    slackUrl,
    isSlackIntegrated,
    refetchQueries,
}: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [syncSlackIntegration, { loading }] = useSyncSlackIntegrationMutation(
        {
            variables: {
                project_id,
            },
            refetchQueries,
        }
    );

    return (
        <div
            className={classNames(styles.selectMessage, styles.notFoundMessage)}
        >
            Can't find the channel or person here?{' '}
            {project_id !== DEMO_WORKSPACE_APPLICATION_ID &&
                (!isSlackIntegrated ? (
                    <a href={slackUrl}>Connect Highlight with Slack</a>
                ) : (
                    <Button
                        className={styles.syncButton}
                        trackingId="SyncHighlightWithSlack"
                        type="text"
                        onClick={async () => {
                            try {
                                const { data } = await syncSlackIntegration();

                                if (
                                    data?.syncSlackIntegration
                                        .newChannelsAddedCount
                                ) {
                                    message.success(
                                        `Synced ${data.syncSlackIntegration.newChannelsAddedCount} Slack channels/people with Highlight!`
                                    );
                                } else {
                                    message.success(
                                        'Synced with Slack! No new Slack channels/people found.'
                                    );
                                }
                            } catch {
                                message.error(
                                    'Something went wrong when syncing with Slack, try again?'
                                );
                            }
                        }}
                        loading={loading}
                    >
                        Sync Highlight with Slack
                    </Button>
                ))}
            .
        </div>
    );
};

export default SyncWithSlackButton;
