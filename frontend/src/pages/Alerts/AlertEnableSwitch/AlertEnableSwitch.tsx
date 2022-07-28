import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Switch from '@components/Switch/Switch';
import {
    useUpdateErrorAlertMutation,
    useUpdateMetricMonitorMutation,
    useUpdateNewSessionAlertMutation,
    useUpdateNewUserAlertMutation,
    useUpdateRageClickAlertMutation,
    useUpdateSessionFeedbackAlertMutation,
    useUpdateTrackPropertiesAlertMutation,
    useUpdateUserPropertiesAlertMutation,
} from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { ALERT_TYPE } from '@pages/Alerts/Alerts';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React, { useState } from 'react';

import styles from './AlertEnableSwitch.module.scss';

export const AlertEnableSwitch: React.FC<{ record: any }> = ({ record }) => {
    const { project_id } = useParams<{ project_id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(record.disabled ?? false);
    const [updateErrorAlert] = useUpdateErrorAlertMutation();
    const [updateNewUserAlert] = useUpdateNewUserAlertMutation();
    const [updateUserPropertiesAlert] = useUpdateUserPropertiesAlertMutation();
    const [updateRageClickAlert] = useUpdateRageClickAlertMutation();
    const [updateMetricMonitor] = useUpdateMetricMonitorMutation();
    const [updateNewSessionAlert] = useUpdateNewSessionAlertMutation();
    const [
        updateTrackPropertiesAlert,
    ] = useUpdateTrackPropertiesAlertMutation();
    const [
        updateSessionFeedbackAlert,
    ] = useUpdateSessionFeedbackAlertMutation();

    const onChange = async () => {
        setLoading(true);
        const isDisabled = !disabled;

        const type = record.configuration.type;
        console.log(record);

        const requestBody = {
            refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
        };

        switch (type) {
            case ALERT_TYPE.Error:
                await updateErrorAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        error_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.FirstTimeUser:
                await updateNewUserAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        session_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.UserProperties:
                await updateUserPropertiesAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        session_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.TrackProperties:
                await updateTrackPropertiesAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        session_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.SessionFeedbackComment:
                await updateSessionFeedbackAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        session_feedback_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.NewSession:
                await updateNewSessionAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        session_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.RageClick:
                await updateRageClickAlert({
                    ...requestBody,
                    variables: {
                        project_id,
                        rage_click_alert_id: record.id,
                        disabled: isDisabled,
                    },
                });
                break;
            case ALERT_TYPE.MetricMonitor:
                await updateMetricMonitor({
                    ...requestBody,
                    variables: {
                        metric_monitor_id: record.id,
                        project_id,
                        disabled: isDisabled,
                    },
                });
                break;
            default:
                throw new Error(`Unsupported alert type: ${type}`);
        }

        message.success(
            isDisabled
                ? `Disabled "${record.Name}"`
                : `Enabled "${record.Name}"`,
            5
        );

        setDisabled(isDisabled);
        setLoading(false);
    };

    return (
        <div className={styles.statusCell} onClick={(e) => e.stopPropagation()}>
            <Switch
                trackingId={`AlertEnable-${record.id}`}
                label={disabled ? 'Disabled' : 'Enabled'}
                loading={loading}
                justifySpaceBetween
                size="small"
                checked={loading ? disabled : !disabled}
                onChange={onChange}
            />
            <InfoTooltip
                title={
                    disabled
                        ? 'This alert is not tracking events and will not notify you.'
                        : 'This alert is tracking events.'
                }
            />
        </div>
    );
};
