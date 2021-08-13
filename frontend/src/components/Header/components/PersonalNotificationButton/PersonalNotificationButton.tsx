import React from 'react';

import { useAuthContext } from '../../../../AuthContext';
import Button from '../../../Button/Button/Button';
import styles from './PersonalNotificationButton.module.scss';
import { useSlackBot } from './utils/utils';

const PersonalNotificationButton = () => {
    const { admin } = useAuthContext();
    const { slackUrl: slackBotUrl } = useSlackBot(window.location.pathname);

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
