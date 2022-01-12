import Button from '@components/Button/Button/Button';
import Input from '@components/Input/Input';
import LineChart from '@components/LineChart/LineChart';
import Select, { OptionType } from '@components/Select/Select';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useGetMetricPreviewQuery } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import { MetricType } from '@graph/schemas';
import SyncWithSlackButton from '@pages/Alerts/AlertConfigurationCard/SyncWithSlackButton';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalDescriptor,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import { Divider } from 'antd';
import moment from 'moment';
import React, { useMemo, useState } from 'react';

import alertConfigurationCardStyles from '../AlertConfigurationCard/AlertConfigurationCard.module.scss';
import styles from './MonitorConfiguration.module.scss';

interface Props {
    loading: boolean;
    metricToMonitorName: string;
    onMetricToMonitorNameChange: (newMetric: string) => void;
    monitorName: string;
    onMonitorNameChange: (newName: string) => void;
    aggregateFunction: string;
    onAggregateFunctionChange: (newAggregateFunction: string) => void;
    threshold: number;
    onThresholdChange: (newThreshold: number) => void;
    slackChannels: string[];
    onSlackChannelsChange: (newChannels: string[]) => void;
    config: WebVitalDescriptor;
    onConfigChange: (newConfig: WebVitalDescriptor) => void;
    onFormSubmit: (values: any) => void;
    channelSuggestions: any[];
    isSlackIntegrated: boolean;
    slackUrl: string;
    formSubmitButtonLabel: string;
    formCancelButtonLabel?: string;
    formDestructiveButtonLabel?: string;
    onFormDestructiveAction?: () => void;
    onFormCancel?: () => void;
}

const MonitorConfiguration = ({
    loading,
    aggregateFunction,
    metricToMonitorName,
    monitorName,
    config,
    threshold,
    onFormSubmit,
    onConfigChange,
    channelSuggestions,
    isSlackIntegrated,
    slackUrl,
    formSubmitButtonLabel,
    formCancelButtonLabel,
    onFormCancel,
    onAggregateFunctionChange,
    onMonitorNameChange,
    onMetricToMonitorNameChange,
    onThresholdChange,
    onSlackChannelsChange,
    slackChannels,
    formDestructiveButtonLabel,
    onFormDestructiveAction,
}: Props) => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [searchQuery, setSearchQuery] = useState('');
    const { data, loading: metricPreviewLoading } = useGetMetricPreviewQuery({
        variables: {
            project_id,
            aggregateFunction: aggregateFunction,
            name: metricToMonitorName,
            type: MetricType.WebVital,
        },
    });

    const graphData = useMemo(() => {
        if (loading) {
            return [];
        }

        const pointsToGenerate = 100;
        const now = new Date();
        if (!data) {
            return Array.from(new Array(pointsToGenerate)).map((_, index) => {
                const randomValue =
                    Math.random() * (config.maxNeedsImprovementValue * 0.7) +
                    config.maxGoodValue * 0.2;
                return {
                    value: randomValue,
                    date: moment(now)
                        .subtract(pointsToGenerate - index, 'minutes')
                        .format('h:mm A'),
                };
            });
        } else {
            return data.metric_preview.map((point, index) => ({
                value: point?.value,
                date: moment(now)
                    .subtract(pointsToGenerate - index, 'minutes')
                    .format('h:mm A'),
            }));
        }
    }, [config.maxGoodValue, config.maxNeedsImprovementValue, data, loading]);

    const metricTypeOptions: OptionType[] = Object.keys(
        WEB_VITALS_CONFIGURATION
    ).map((key) => {
        const config = WEB_VITALS_CONFIGURATION[key];

        return {
            displayValue: config.name,
            id: config.name,
            value: key,
        };
    });

    const functionOptions: string[] = ['avg', 'p50', 'p75', 'p90', 'p99'];

    const channels = channelSuggestions.map(
        ({ webhook_channel, webhook_channel_id }) => ({
            displayValue: webhook_channel,
            value: webhook_channel_id,
            id: webhook_channel_id,
        })
    );

    return (
        <div>
            <div className={styles.chartContainer}>
                {metricPreviewLoading ? (
                    <Skeleton height="231px" />
                ) : (
                    <LineChart
                        height={235}
                        data={graphData}
                        hideLegend
                        xAxisDataKeyName="date"
                        lineColorMapping={{
                            value: 'var(--color-blue-400)',
                        }}
                        yAxisLabel={config.units}
                        referenceAreaProps={
                            graphData.length > 0
                                ? {
                                      x1: graphData[0].date,
                                      y1: threshold,
                                      fill: 'var(--color-red-200)',
                                      fillOpacity: 0.3,
                                  }
                                : undefined
                        }
                        referenceLines={[
                            {
                                value: threshold,
                                color: 'var(--color-red-400)',
                            },
                        ]}
                        xAxisProps={{
                            tickLine: {
                                stroke: 'var(--color-gray-600)',
                            },
                            axisLine: {
                                stroke: 'var(--color-gray-600)',
                            },
                        }}
                    />
                )}
            </div>
            <form name="newMonitor" onSubmit={onFormSubmit} autoComplete="off">
                <section>
                    <h3>Metric to Monitor</h3>
                    <p>
                        Select which metric you'd like to create a monitor for.
                    </p>
                    <Select
                        options={metricTypeOptions}
                        placeholder="Metric to Monitor"
                        className={styles.select}
                        value={metricToMonitorName}
                        onChange={(e) => {
                            onMetricToMonitorNameChange(e);
                            onConfigChange(WEB_VITALS_CONFIGURATION[e]);
                        }}
                    />
                </section>

                <section>
                    <h3>Function</h3>
                    <p>
                        Select the function that will aggregate the value. The
                        aggregated value will be used to compare against the
                        threshold when deciding whether to create an alert.
                    </p>
                    <Select
                        options={functionOptions.map((functionName) => ({
                            displayValue: functionName,
                            id: functionName,
                            value: functionName,
                        }))}
                        className={styles.select}
                        value={aggregateFunction}
                        onChange={(e) => {
                            onAggregateFunctionChange(e);
                        }}
                    />
                </section>

                <section>
                    <h3>Threshold</h3>
                    <p>
                        An alert will be created if{' '}
                        <code>
                            <b
                                style={{
                                    color: 'var(--color-blue-400)',
                                }}
                            >
                                {aggregateFunction}({config?.name})
                            </b>
                        </code>{' '}
                        is over{' '}
                        <b style={{ color: 'var(--color-red-400)' }}>
                            {threshold}
                        </b>
                        .
                    </p>
                    <Input
                        addonAfter={config?.units || undefined}
                        value={threshold}
                        onChange={(e) => {
                            onThresholdChange(
                                (e.target.value as unknown) as number
                            );
                        }}
                    />
                </section>

                <section>
                    <h3>Name</h3>
                    <p>
                        Add a name for your monitor. This makes it easier to
                        find later. This can be changed at anytime.
                    </p>
                    <Input
                        value={monitorName}
                        onChange={(e) => {
                            onMonitorNameChange(e.target.value);
                        }}
                    />
                </section>

                <section>
                    <h3>Channels to Notify</h3>
                    <p>
                        Pick Slack channels or people to message when an alert
                        is created.
                    </p>
                    <Select
                        className={alertConfigurationCardStyles.channelSelect}
                        options={channels}
                        mode="multiple"
                        onSearch={(value) => {
                            setSearchQuery(value);
                        }}
                        value={slackChannels}
                        onChange={onSlackChannelsChange}
                        filterOption={(searchValue, option) => {
                            return option?.children
                                .toLowerCase()
                                .includes(searchValue.toLowerCase());
                        }}
                        placeholder={`Select a channel(s) or person(s) to send the alert to.`}
                        notFoundContent={
                            <SyncWithSlackButton
                                isSlackIntegrated={isSlackIntegrated}
                                slackUrl={slackUrl}
                                refetchQueries={[
                                    namedOperations.Query.GetAlertsPagePayload,
                                ]}
                            />
                        }
                        dropdownRender={(menu) => (
                            <div>
                                {menu}
                                {searchQuery.length === 0 &&
                                    channelSuggestions.length > 0 && (
                                        <>
                                            <Divider
                                                style={{
                                                    margin: '4px 0',
                                                }}
                                            />
                                            <div
                                                className={
                                                    alertConfigurationCardStyles.addContainer
                                                }
                                            >
                                                <SyncWithSlackButton
                                                    isSlackIntegrated={
                                                        isSlackIntegrated
                                                    }
                                                    slackUrl={slackUrl}
                                                    refetchQueries={[
                                                        namedOperations.Query
                                                            .GetAlertsPagePayload,
                                                    ]}
                                                />
                                            </div>
                                        </>
                                    )}
                            </div>
                        )}
                    />
                </section>

                <div className={styles.formFooter}>
                    {onFormCancel && (
                        <Button
                            trackingId="CancelCreateMonitor"
                            type="default"
                            onClick={() => {
                                onFormCancel();
                            }}
                        >
                            {formCancelButtonLabel}
                        </Button>
                    )}
                    {onFormDestructiveAction && (
                        <Button
                            trackingId="DestructiveCreateMonitor"
                            danger
                            type="default"
                            onClick={() => {
                                onFormDestructiveAction();
                            }}
                        >
                            {formDestructiveButtonLabel}
                        </Button>
                    )}
                    <Button
                        trackingId="CreateMonitor"
                        htmlType="submit"
                        type="primary"
                    >
                        {formSubmitButtonLabel}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MonitorConfiguration;
