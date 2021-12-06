import Button from '@components/Button/Button/Button';
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React from 'react';

import styles from './SyncWithSlackButton.module.scss';

interface Props {
    slackUrl: string;
    isSlackIntegrated: boolean;
}

const SyncWithSlackButton = ({ slackUrl, isSlackIntegrated }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();

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
                        href={slackUrl}
                    >
                        Sync Highlight with Slack
                    </Button>
                ))}
            .
        </div>
    );
};

export default SyncWithSlackButton;
