import React from 'react';

import { alertsBody } from './Alerts.module.scss';
import SlackIntegration from './SlackIntegration/SlackIntegration';

export const AlertsPage = () => {
    return (
        <div className={alertsBody}>
            <SlackIntegration redirectPath="alerts" />
        </div>
    );
};
