import React from 'react';

import Button, {
    GenericHighlightButtonProps,
} from '../../../Button/Button/Button';
import { useAuthContext } from './../../../../authentication/AuthContext';
import styles from './PersonalNotificationButton.module.scss';
import { useSlackBot } from './utils/utils';

type Props = { text?: string } & Pick<
    GenericHighlightButtonProps,
    'className' | 'style'
>;

const PersonalNotificationButton = ({ ...props }: Props) => {
    const { isHighlightAdmin, admin } = useAuthContext();

    let redirectUrl = window.location.pathname;
    // this doesn't work if we redirect to /alerts
    redirectUrl = redirectUrl.replace('alerts', 'home');
    if (redirectUrl.length > 3) {
        // remove orgid and prepended slash
        redirectUrl = redirectUrl.substring(redirectUrl.indexOf('/', 1) + 1);
    }
    const { slackUrl: slackBotUrl } = useSlackBot(redirectUrl);

    if (!isHighlightAdmin) return null;

    // personal notifications are already setup
    if (!!admin?.slack_im_channel_id) return null;

    return (
        <Button
            className={styles.personalNotificationButton}
            type="primary"
            trackingId="EnablePersonalNotificationButton"
            href={slackBotUrl}
            style={props.style}
        >
            {props?.text || 'Enable Personal Notifications?'}
        </Button>
    );
};

export default PersonalNotificationButton;
