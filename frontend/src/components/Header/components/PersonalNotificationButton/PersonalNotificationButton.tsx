import { useGetWorkspaceIsIntegratedWithSlackQuery } from '@graph/hooks';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect } from 'react';

import Button, {
    GenericHighlightButtonProps,
} from '../../../Button/Button/Button';
import { useAuthContext } from './../../../../authentication/AuthContext';
import styles from './PersonalNotificationButton.module.scss';
import { useSlackBot, UseSlackBotProps } from './utils/utils';

type Props = { text?: string } & Pick<
    GenericHighlightButtonProps,
    'className' | 'style'
> &
    Pick<UseSlackBotProps, 'type'>;

const PersonalNotificationButton = ({
    className,
    style,
    text,
    type,
}: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { admin, isLoggedIn } = useAuthContext();
    const [isIntegratedWithSlack, setIsIntegratedWithSlack] = useLocalStorage(
        `${project_id}-${type}-personalNotifications`,
        false
    );
    const { data } = useGetWorkspaceIsIntegratedWithSlackQuery({
        variables: {
            project_id,
        },
    });
    const [, setSetupType] = useLocalStorage<'' | 'Personal' | 'Organization'>(
        'Highlight-slackBotSetupType',
        ''
    );

    const { slackUrl: slackBotUrl } = useSlackBot({ type, watch: true });

    useEffect(() => {
        // personal notifications are already setup
        if (admin && type === 'Personal') {
            if (!!admin.slack_im_channel_id) {
                setIsIntegratedWithSlack(true);
            } else {
                setIsIntegratedWithSlack(false);
            }
        }

        if (data && type === 'Organization') {
            // slack workspace has already been integrated
            if (data.is_integrated_with_slack) {
                setIsIntegratedWithSlack(true);
            } else {
                setIsIntegratedWithSlack(false);
            }
        }
    }, [admin, data, setIsIntegratedWithSlack, type]);

    if (!isLoggedIn || isIntegratedWithSlack) return null;

    return (
        <Button
            className={classNames(className, styles.personalNotificationButton)}
            type="primary"
            trackingId="EnablePersonalNotificationButton"
            href={slackBotUrl}
            style={style}
            onClick={() => {
                switch (type) {
                    case 'Organization':
                        setSetupType('Organization');
                        break;
                    case 'Personal':
                        setSetupType('Personal');
                        break;
                }
            }}
        >
            {text || 'Tag Slack Channels in Comments'}
        </Button>
    );
};

export default PersonalNotificationButton;
