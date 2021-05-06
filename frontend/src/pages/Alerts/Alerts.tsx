import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetErrorAlertQuery } from '../../graph/generated/hooks';

import { alertsBody } from './Alerts.module.scss';
import SlackIntegration from './SlackIntegration/SlackIntegration';

export const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetErrorAlertQuery({
        variables: { organization_id: organization_id },
    });
    console.log(data);
    return (
        <div className={alertsBody}>
            <SlackIntegration redirectPath="alerts" />
        </div>
    );
};
