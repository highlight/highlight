import Card from '@components/Card/Card';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalDescriptor,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
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
