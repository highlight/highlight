import React from 'react';
import { useParams } from 'react-router-dom';

import {
    useGetEnvironmentSuggestionQuery,
    useGetErrorAlertsQuery,
    useGetSlackChannelSuggestionQuery,
} from '../../graph/generated/hooks';
import { alertsBody } from './Alerts.module.scss';
import SlackIntegration from './SlackIntegration/SlackIntegration';

const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data: alertData, error: alertError } = useGetErrorAlertsQuery({
        variables: { organization_id: organization_id },
    });
    const {
        data: environmentData,
        error: environmentError,
    } = useGetEnvironmentSuggestionQuery({
        variables: { organization_id: organization_id, query: 'p' },
    });
    const {
        data: slackData,
        error: slackError,
    } = useGetSlackChannelSuggestionQuery({
        variables: { organization_id: organization_id },
    });
    // TODO: @John, we need to prepooulate/deduplicate the environments w/ 'production', 'staging' and 'development'.
    // And any additional ones should be returned in the suggestion.
    console.log('alerts', alertData, alertError);
    console.log('environments', environmentData, environmentError);
    console.log('slack_suggestion', slackData, slackError);

    return (
        <div className={alertsBody}>
            <SlackIntegration redirectPath="alerts" />
        </div>
    );
};

export default AlertsPage;
