import Card from '@components/Card/Card';
import { useCreateMetricMonitorMutation } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalDescriptor,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import message from 'antd/lib/message';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';

interface Props {
    channelSuggestions: any[];
    isSlackIntegrated: boolean;
}

const NewMonitorPage = ({ channelSuggestions, isSlackIntegrated }: Props) => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const newMonitorTypeSearchParam = useSearchParam('type');
    const { slackUrl, loading } = useAlertsContext();
    const history = useHistory();
    const [metricToMonitorName, setMetricToMonitorName] = useState<string>(
        (newMonitorTypeSearchParam &&
            newMonitorTypeSearchParam in WEB_VITALS_CONFIGURATION &&
            newMonitorTypeSearchParam) ||
            'LCP'
    );
    const [config, setConfig] = useState<WebVitalDescriptor>(
        WEB_VITALS_CONFIGURATION[metricToMonitorName]
    );
    const [monitorName, setMonitorName] = useState('New Monitor');
    const [functionName, setFunctionName] = useState<string>('p90');
    const [threshold, setThreshold] = useState<number>(1000);
    const [slackChannels, setSlackChannels] = useState<string[]>([]);
    const [createMonitor] = useCreateMetricMonitorMutation({
        variables: {
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
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });

    const onFinish = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        createMonitor();
        message.success(`Created ${monitorName} monitor!`);
        history.push(`/${project_id}/alerts`);
    };

    useEffect(() => {
        if (config) {
            setThreshold(config.maxGoodValue);
        }
    }, [config]);

    return (
        <div>
            <Helmet>
                <title>Create New Metric Monitor</title>
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

export default NewMonitorPage;
