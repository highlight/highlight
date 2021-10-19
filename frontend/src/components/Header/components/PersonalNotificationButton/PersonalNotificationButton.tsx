import { useGetWorkspaceIsIntegratedWithSlackQuery } from '@graph/hooks';
import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React from 'react';

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

    if (!isLoggedIn) return null;

    // personal notifications are already setup
    if (type === 'Personal' && !!admin?.slack_im_channel_id) return null;

    // slack workspace has already been integrated
    if (type === 'Organization' && data?.is_integrated_with_slack) {
        return null;
    }

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
            {text || 'Get Comment Notifications'}
        </Button>
    );
};

export default PersonalNotificationButton;
