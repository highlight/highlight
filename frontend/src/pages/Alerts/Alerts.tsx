import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetErrorAlertsQuery } from '../../graph/generated/hooks';
import { alertsBody } from './Alerts.module.scss';
import SlackIntegration from './SlackIntegration/SlackIntegration';

const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetErrorAlertsQuery({
        variables: { organization_id: organization_id },
    });
    console.log('alerts', data);
    return (
        <div className={alertsBody}>
            <SlackIntegration redirectPath="alerts" />
        </div>
    );
};

export default AlertsPage;
