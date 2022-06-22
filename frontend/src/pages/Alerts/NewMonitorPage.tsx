import Card from '@components/Card/Card';
import { useCreateMetricMonitorMutation } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { DashboardMetricConfig } from '@graph/schemas';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration';
import { WEB_VITALS_CONFIGURATION } from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import message from 'antd/lib/message';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router-dom';
import { useSearchParam } from 'react-use';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';

interface Props {
    channelSuggestions: any[];
    emailSuggestions: string[];
    isSlackIntegrated: boolean;
}

const NewMonitorPage = ({
    channelSuggestions,
    isSlackIntegrated,
    emailSuggestions,
}: Props) => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const newMonitorTypeSearchParam = useSearchParam('type');
    const { slackUrl, loading } = useAlertsContext();
    const history = useHistory();
    const [metricToMonitorName, setMetricToMonitorName] = useState<string>(
        newMonitorTypeSearchParam || 'LCP'
    );
    const [config, setConfig] = useState<DashboardMetricConfig>(
        WEB_VITALS_CONFIGURATION[metricToMonitorName] ||
            WEB_VITALS_CONFIGURATION['LCP']
    );
    const [monitorName, setMonitorName] = useState('New Monitor');
    const [functionName, setFunctionName] = useState<string>('p90');
    const [threshold, setThreshold] = useState<number>(1000);
    const [slackChannels, setSlackChannels] = useState<string[]>([]);
    const [emails, setEmails] = useState<string[]>([]);
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
            emails,
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
            setThreshold(config.max_good_value);
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
                        emailSuggestions={emailSuggestions}
                        emails={emails}
                        onEmailsChange={setEmails}
                    />
                </Card>
            </>
        </div>
    );
};

export default NewMonitorPage;
