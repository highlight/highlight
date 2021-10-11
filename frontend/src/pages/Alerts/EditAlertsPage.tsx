import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { GetAlertsPagePayloadQuery } from '@graph/operations';
import { AlertConfigurationCard } from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationCard';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

interface Props {
    isEditing: boolean;
}

const EditAlertsPage = ({ isEditing }: Props) => {
    const { id } = useParams<{ id: string }>();
    const { slackUrl, alertsPayload, loading } = useAlertsContext();

    const alert = isEditing && id ? findAlert(id, alertsPayload) : undefined;

    return (
        <LeadAlignLayout>
            <h2>New Alert</h2>
            {loading || !alertsPayload || !alert ? (
                <h2>Loading</h2>
            ) : (
                <AlertConfigurationCard
                    alert={alert}
                    slackUrl={slackUrl}
                    channelSuggestions={
                        alertsPayload?.slack_channel_suggestion || []
                    }
                    environmentOptions={
                        alertsPayload?.environment_suggestion || []
                    }
                    // @ts-expect-error
                    configuration={ALERT_CONFIGURATIONS[alert?.Type]}
                />
            )}
        </LeadAlignLayout>
    );
};

export default EditAlertsPage;

const findAlert = (id: string, alertsPayload?: GetAlertsPagePayloadQuery) => {
    if (!alertsPayload) {
        return undefined;
    }

    const allAlerts = [
        ...alertsPayload.error_alerts,
        ...alertsPayload.new_session_alerts,
        ...(alertsPayload.new_user_alerts || []),
        ...alertsPayload.session_feedback_alerts,
        ...alertsPayload.track_properties_alerts,
        ...alertsPayload.user_properties_alerts,
    ];

    return allAlerts.find((alert) => alert?.id === id);
};
