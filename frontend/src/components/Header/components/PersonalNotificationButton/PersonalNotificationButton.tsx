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
    const { admin, isLoggedIn } = useAuthContext();

    const { slackUrl: slackBotUrl } = useSlackBot({ type });

    if (!isLoggedIn) return null;

    // personal notifications are already setup
    if (!!admin?.slack_im_channel_id) return null;

    return (
        <Button
            className={classNames(className, styles.personalNotificationButton)}
            type="primary"
            trackingId="EnablePersonalNotificationButton"
            href={slackBotUrl}
            style={style}
        >
            {text || 'Get Comment Notifications'}
        </Button>
    );
};

export default PersonalNotificationButton;
