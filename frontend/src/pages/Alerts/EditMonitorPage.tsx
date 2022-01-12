import Card from '@components/Card/Card';
import { GetAlertsPagePayloadQuery } from '@graph/operations';
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
    isSlackIntegrated: boolean;
}

const EditMonitorPage = ({ channelSuggestions, isSlackIntegrated }: Props) => {
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

    const onFinish = (e: { preventDefault: () => void }) => {
        e.preventDefault();
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
            } = existingMonitor;

            setMetricToMonitorName(metric_to_monitor);
            setMonitorName(name);
            setThreshold(threshold);
            setSlackChannels(
                channels_to_notify?.map(
                    (channel: any) => channel.webhook_channel_id
                ) || []
            );
            setFunctionName(functionName);
        }

        if (!loading && existingMonitor === undefined) {
            message.error("The monitor you tried viewing doesn't exist");
            history.push(`/${project_id}/alerts`);
        }
    }, [existingMonitor, history, loading, project_id]);

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
                        onFormCancel={() => {
                            history.push(`/${project_id}/alerts/new`);
                        }}
                        formCancelButtonLabel="Cancel"
                        formSubmitButtonLabel="Create"
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
