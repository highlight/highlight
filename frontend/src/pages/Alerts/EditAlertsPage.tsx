import {
    useDeleteErrorAlertMutation,
    useDeleteSessionAlertMutation,
} from '@graph/hooks';
import { GetAlertsPagePayloadQuery, namedOperations } from '@graph/operations';
import { AlertConfigurationCard } from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationCard';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

interface Props {
    isEditing: boolean;
}

const EditAlertsPage = ({ isEditing }: Props) => {
    const { id, project_id } = useParams<{ id: string; project_id: string }>();
    const { slackUrl, alertsPayload, loading } = useAlertsContext();

    const alert = isEditing && id ? findAlert(id, alertsPayload) : undefined;
    const [deleteErrorAlert, {}] = useDeleteErrorAlertMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [deleteSessionAlert, {}] = useDeleteSessionAlertMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
        update(cache, data) {
            const normalizedId = cache.identify({
                id: data.data?.deleteSessionAlert?.id,
                __typename: data.data?.__typename,
            });
            cache.evict({ id: normalizedId });
            cache.gc();
        },
    });

    return (
        <>
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
                    onDeleteHandler={(alertId) => {
                        if (!alert) {
                            return;
                        }
                        if (alert?.Type === 'Errors') {
                            deleteErrorAlert({
                                variables: {
                                    error_alert_id: alertId,
                                    project_id,
                                },
                            });
                        } else {
                            deleteSessionAlert({
                                variables: {
                                    session_alert_id: alertId,
                                    project_id,
                                },
                            });
                        }
                    }}
                />
            )}
        </>
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
