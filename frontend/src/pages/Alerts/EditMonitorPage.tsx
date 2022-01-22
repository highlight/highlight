import Card from '@components/Card/Card';
import {
    useDeleteMetricMonitorMutation,
    useUpdateMetricMonitorMutation,
} from '@graph/hooks';
import { GetAlertsPagePayloadQuery, namedOperations } from '@graph/operations';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalDescriptor,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';

interface Props {
    channelSuggestions: any[];
    emailSuggestions: string[];
    isSlackIntegrated: boolean;
}

const EditMonitorPage = ({
    channelSuggestions,
    isSlackIntegrated,
    emailSuggestions,
}: Props) => {
    const { project_id, id } = useParams<{
        project_id: string;
        id: string;
    }>();
    const { slackUrl, loading, alertsPayload } = useAlertsContext();
    const existingMonitor = id ? findMonitor(id, alertsPayload) : undefined;
    const history = useHistory();
    const [metricToMonitorName, setMetricToMonitorName] = useState<string>(
        'LCP'
    );
    const [config, setConfig] = useState<WebVitalDescriptor>(
        WEB_VITALS_CONFIGURATION[metricToMonitorName]
    );
    const [monitorName, setMonitorName] = useState('');
    const [functionName, setFunctionName] = useState<string>('p90');
    const [threshold, setThreshold] = useState<number>(1000);
    const [slackChannels, setSlackChannels] = useState<string[]>([]);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [emails, setEmails] = useState<string[]>([]);
    const [updateMonitor] = useUpdateMetricMonitorMutation({
        variables: {
            metric_monitor_id: id,
            project_id,
            function: functionName,
            metric_to_monitor: metricToMonitorName,
            name: monitorName,
            slack_channels: slackChannels.map((webhook_channel_id: string) => ({
                webhook_channel_name: channelSuggestions.find(
                    (suggestion) =>
                        suggestion.webhook_channel_id === webhook_channel_id
                ).webhook_channel,
                webhook_channel_id,
            })),
            threshold,
            emails,
            disabled: isDisabled,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [deleteMonitor] = useDeleteMetricMonitorMutation({
        variables: {
            metric_monitor_id: id,
            project_id,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });

    const onFinish = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        updateMonitor();
        message.success('Monitor updated!');
    };

    useEffect(() => {
        if (config) {
            setThreshold(config.maxGoodValue);
        }
    }, [config]);

    useEffect(() => {
        if (!loading && existingMonitor) {
            const {
                channels_to_notify,
                function: functionName,
                metric_to_monitor,
                name,
                threshold,
                emails_to_notify,
                disabled,
            } = existingMonitor;

            setMetricToMonitorName(metric_to_monitor);
            setMonitorName(name);
            setThreshold(threshold);
            setEmails((emails_to_notify as string[]) || []);
            setSlackChannels(
                channels_to_notify?.map(
                    (channel: any) => channel.webhook_channel_id
                ) || []
            );
            setFunctionName(functionName);
            setIsDisabled(disabled);
        }

        if (
            !loading &&
            existingMonitor === undefined &&
            alertsPayload !== undefined
        ) {
            message.error("The monitor you tried viewing doesn't exist");
            history.push(`/${project_id}/alerts`);
        }
    }, [alertsPayload, existingMonitor, history, loading, project_id]);

    return (
        <div>
            <Helmet>
                <title>Edit Metric Monitor</title>
            </Helmet>
            <>
                <p className={layoutStyles.subTitle}>
                    Monitors are a special type of alert. Monitors will send you
                    an alert when a metric exceeds a value.
                </p>
                <Card>
                    <MonitorConfiguration
                        onAggregateFunctionChange={setFunctionName}
                        onMonitorNameChange={setMonitorName}
                        onConfigChange={setConfig}
                        onMetricToMonitorNameChange={setMetricToMonitorName}
                        onSlackChannelsChange={setSlackChannels}
                        slackChannels={slackChannels}
                        onThresholdChange={setThreshold}
                        aggregateFunction={functionName}
                        config={config}
                        loading={loading}
                        metricToMonitorName={metricToMonitorName}
                        monitorName={monitorName}
                        threshold={threshold}
                        channelSuggestions={channelSuggestions}
                        onFormSubmit={onFinish}
                        isSlackIntegrated={isSlackIntegrated}
                        slackUrl={slackUrl}
                        formSubmitButtonLabel="Save"
                        onFormDestructiveAction={async () => {
                            await deleteMonitor();
                            message.success('Monitor deleted!');
                            history.push(`/${project_id}/alerts`);
                        }}
                        formDestructiveButtonLabel="Delete"
                        emailSuggestions={emailSuggestions}
                        emails={emails}
                        onEmailsChange={setEmails}
                        disabled={isDisabled}
                        setIsDisabled={setIsDisabled}
                    />
                </Card>
            </>
        </div>
    );
};

export default EditMonitorPage;

function findMonitor(id: any, alertsPayload?: GetAlertsPagePayloadQuery) {
    if (!alertsPayload) {
        return undefined;
    }

    return alertsPayload.metric_monitors.find((monitor) => monitor?.id === id);
}
