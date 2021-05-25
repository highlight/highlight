import React from 'react';
import { useParams } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import {
    useGetEnvironmentSuggestionQuery,
    useGetErrorAlertsQuery,
    useGetSlackChannelSuggestionQuery,
    useUpdateErrorAlertMutation,
} from '../../graph/generated/hooks';
import { AlertConfigurationCard } from './AlertConfigurationCard/AlertConfigurationCard';
import styles from './Alerts.module.scss';

const ALERT_CONFIGURATIONS = [
    {
        name: 'Error Alerts',
        canControlThreshold: true,
    },
    {
        name: 'Session Alerts',
        canControlThreshold: false,
    },
    {
        name: 'First Time User Alerts',
        canControlThreshold: true,
    },
    {
        name: 'Track Event Alerts',
        canControlThreshold: false,
    },
];
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

    const mutation = useUpdateErrorAlertMutation();
    console.log(mutation);
    // TODO: @John, we need to prepooulate/deduplicate the environments w/ 'production', 'staging' and 'development'.
    // And any additional ones should be returned in the suggestion.
    console.log('alerts', alertData, alertError);
    console.log('environments', environmentData, environmentError);
    console.log('slack_suggestion', slackData, slackError);

    return (
        <LeadAlignLayout>
            <h2>Configure your alerts</h2>
            <p className={layoutStyles.subTitle}>
                Configure the environments you want alerts for.
            </p>

            <div className={styles.configurationContainer}>
                {ALERT_CONFIGURATIONS.map((configuration) => (
                    <AlertConfigurationCard
                        key={configuration.name}
                        configuration={configuration}
                    />
                ))}
            </div>
        </LeadAlignLayout>
    );
};

export default AlertsPage;
