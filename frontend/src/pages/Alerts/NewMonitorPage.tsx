import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import Input from '@components/Input/Input';
import Select, { OptionType } from '@components/Select/Select';
import { namedOperations } from '@graph/operations';
import SyncWithSlackButton from '@pages/Alerts/AlertConfigurationCard/SyncWithSlackButton';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import {
    WEB_VITALS_CONFIGURATION,
    WebVitalDescriptor,
} from '@pages/Player/StreamElement/Renderers/WebVitals/utils/WebVitalsUtils';
import { useParams } from '@util/react-router/useParams';
import { Divider, Form } from 'antd';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory, useRouteMatch } from 'react-router-dom';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import alertConfigurationCardStyles from './AlertConfigurationCard/AlertConfigurationCard.module.scss';
import styles from './NewMonitorPage.module.scss';

interface Props {
    channelSuggestions: any[];
    isSlackIntegrated: boolean;
}

const NewMonitorPage = ({ channelSuggestions, isSlackIntegrated }: Props) => {
    const { url } = useRouteMatch();
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const { alertsPayload, slackUrl } = useAlertsContext();
    const history = useHistory();
    const [form] = Form.useForm();
    const [config, setConfig] = useState<WebVitalDescriptor | null>(null);
    const [functionName, __setFunctionName] = useState<string>('p90');
    const [searchQuery, setSearchQuery] = useState('');

    const onFinish = (values: any) => {
        console.log('Success:', values);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

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

    const channels = channelSuggestions.map(
        ({ webhook_channel, webhook_channel_id }) => ({
            displayValue: webhook_channel,
            value: webhook_channel_id,
            id: webhook_channel_id,
        })
    );

    const functionOptions: string[] = ['avg', 'p50', 'p75', 'p90', 'p99'];

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
                    <Form
                        form={form}
                        name="newMonitor"
                        initialValues={{
                            function: 'p90',
                            threshold: config?.maxGoodValue || 1000,
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                        onValuesChange={(changedValues) => {
                            if ('metricToMonitor' in changedValues) {
                                const webVitalConfig =
                                    WEB_VITALS_CONFIGURATION[
                                        changedValues.metricToMonitor
                                    ];

                                form.setFields([
                                    {
                                        name: 'threshold',
                                        value: webVitalConfig.maxGoodValue,
                                    },
                                ]);
                                setConfig(webVitalConfig);
                            }
                            if ('function' in changedValues) {
                                __setFunctionName(changedValues.function);
                            }
                        }}
                    >
                        <section>
                            <h3>Metric to Monitor</h3>
                            <p>
                                Select which metric you'd like to create a
                                monitor for.
                            </p>
                            <Form.Item
                                name="metricToMonitor"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'You need to pick a metric to monitor.',
                                    },
                                ]}
                            >
                                <Select
                                    options={metricTypeOptions}
                                    placeholder="Metric to Monitor"
                                />
                            </Form.Item>
                        </section>

                        <section>
                            <h3>Name</h3>
                            <p>
                                Add a name for your monitor. This makes it
                                easier to find later. This can be changed at
                                anytime.
                            </p>
                            <Form.Item
                                name="name"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Your monitor needs a name.',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </section>

                        <section>
                            <h3>Function</h3>
                            <p>
                                Select the function that will aggregate the
                                value. The aggregated value will be used to
                                compare against the threshold when deciding
                                whether to create an alert.
                            </p>
                            <Form.Item
                                shouldUpdate
                                name="function"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Select
                                    options={functionOptions.map(
                                        (functionName) => ({
                                            displayValue: functionName,
                                            id: functionName,
                                            value: functionName,
                                        })
                                    )}
                                />
                            </Form.Item>
                        </section>

                        <section>
                            <h3>Threshold</h3>
                            <p>
                                An alert will be created if{' '}
                                <code>
                                    <b>
                                        {functionName}
                                        (Cumulative Layout Shift)
                                    </b>
                                </code>{' '}
                                is over <b>1000</b>.
                            </p>
                            <Form.Item
                                shouldUpdate
                                name="threshold"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input
                                    addonAfter={config?.units || undefined}
                                />
                            </Form.Item>
                        </section>

                        <section>
                            <h3>Channels to Notify</h3>
                            <p>
                                Pick Slack channels or people to message when an
                                alert is created.
                            </p>
                            <Form.Item
                                shouldUpdate
                                name="slackChannels"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            'You need to pick a channel or person to send the alert to.',
                                    },
                                ]}
                            >
                                <Select
                                    className={
                                        alertConfigurationCardStyles.channelSelect
                                    }
                                    options={channels}
                                    mode="multiple"
                                    onSearch={(value) => {
                                        setSearchQuery(value);
                                    }}
                                    filterOption={(searchValue, option) => {
                                        return option?.children
                                            .toLowerCase()
                                            .includes(
                                                searchValue.toLowerCase()
                                            );
                                    }}
                                    placeholder={`Select a channel(s) or person(s) to send the alert to.`}
                                    notFoundContent={
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
                                    }
                                    dropdownRender={(menu) => (
                                        <div>
                                            {menu}
                                            {searchQuery.length === 0 &&
                                                channelSuggestions.length >
                                                    0 && (
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
                                                                slackUrl={
                                                                    slackUrl
                                                                }
                                                                refetchQueries={[
                                                                    namedOperations
                                                                        .Query
                                                                        .GetAlertsPagePayload,
                                                                ]}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                        </div>
                                    )}
                                />
                            </Form.Item>
                        </section>

                        <div className={styles.formFooter}>
                            <Button
                                trackingId="CancelCreateMonitor"
                                type="default"
                                onClick={() => {
                                    history.push(`/${project_id}/alerts/new`);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                trackingId="CreateMonitor"
                                htmlType="submit"
                                type="primary"
                            >
                                Create Monitor
                            </Button>
                        </div>
                    </Form>
                </Card>
            </>
        </div>
    );
};

export default NewMonitorPage;
