import React from 'react';

import { useAuthContext } from '../../../../AuthContext';
import Button from '../../../Button/Button/Button';
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

    console.log('slack id: ', admin?.slack_im_channel_id);
    if (
        !isHighlightAdmin ||
        (admin?.slack_im_channel_id !== null &&
            admin?.slack_im_channel_id !== undefined &&
            admin?.slack_im_channel_id !== 'null')
    )
        return null;

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
