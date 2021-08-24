import React from 'react';

import Button from '../../../Button/Button/Button';
import { useAuthContext } from './../../../../authentication/AuthContext';
import styles from './PersonalNotificationButton.module.scss';
import { useSlackBot } from './utils/utils';

const PersonalNotificationButton = () => {
    const { isHighlightAdmin, admin } = useAuthContext();

    let redirectUrl = window.location.pathname;
    // this doesn't work if we redirect to /alerts
    redirectUrl = redirectUrl.replace('alerts', 'home');
    if (redirectUrl.length > 3) {
        // remove orgid and prepended slash
        redirectUrl = redirectUrl.substring(redirectUrl.indexOf('/', 1) + 1);
    }
    const { slackUrl: slackBotUrl } = useSlackBot(redirectUrl);

    if (!isHighlightAdmin || !!admin?.slack_im_channel_id !== null) return null;

    return (
        <Button
            className={styles.personalNotificationButton}
            type="primary"
            trackingId="personalNotificationButton"
            href={slackBotUrl}
        >
            Enable Personal Notifications?
        </Button>
    );
};

export default PersonalNotificationButton;
