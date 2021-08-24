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

    if (!isHighlightAdmin) return null;

    // this should be in alerts page, yah? no reason to make it way too easy to ignore highlight
    if (!!!admin?.slack_im_channel_id) {
        return (
            <Button
                type="primary"
                trackingId="DisablePersonalNotificationButton"
                onClick={() => {
                    admin?.id;
                }}
            >
                Disable Personal Notifications?
            </Button>
        );
    }

    return (
        <Button
            className={styles.personalNotificationButton}
            type="primary"
            trackingId="EnablePersonalNotificationButton"
            href={slackBotUrl}
        >
            Enable Personal Notifications?
        </Button>
    );
};

export default PersonalNotificationButton;
