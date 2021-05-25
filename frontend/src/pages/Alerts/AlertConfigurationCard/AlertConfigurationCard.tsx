import { Divider, Form, message } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Button from '../../../components/Button/Button/Button';
import Collapsible from '../../../components/Collapsible/Collapsible';
import InputNumber from '../../../components/InputNumber/InputNumber';
import Select from '../../../components/Select/Select';
import { useUpdateErrorAlertMutation } from '../../../graph/generated/hooks';
import styles from './AlertConfigurationCard.module.scss';

interface AlertConfiguration {
    name: string;
    canControlThreshold: boolean;
}

interface Props {
    alert: any;
    configuration: AlertConfiguration;
    environmentOptions: any[];
    channelSuggestions: any[];
}

export const AlertConfigurationCard = ({
    alert,
    configuration: { name, canControlThreshold },
    environmentOptions,
    channelSuggestions,
}: Props) => {
    const [loading, setLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const { organization_id } = useParams<{ organization_id: string }>();
    const [form] = Form.useForm();
    const [updateErrorAlert] = useUpdateErrorAlertMutation();

    const onSubmit = async () => {
        setLoading(true);
        try {
            await updateErrorAlert({
                variables: {
                    organization_id,
                    environments: form.getFieldValue('excludedEnvironments'),
                    count_threshold: form.getFieldValue('threshold'),
                    slack_channels: form
                        .getFieldValue('channels')
                        .map((webhook_channel_id: string) => ({
                            webhook_channel_name: channelSuggestions.find(
                                (suggestion) =>
                                    suggestion.webhook_channel_id ===
                                    webhook_channel_id
                            ).webhook_channel,
                            webhook_channel_id,
                        })),
                    error_alert_id: alert.id,
                },
                refetchQueries: ['GetAlertsPagePayload'],
            });
            message.success(`Updated ${name}!`);
            setFormTouched(false);
        } catch (e) {
            message.error(
                `There was a problem updating ${name}. Please try again.`
            );
        }
        setLoading(false);
    };

    const channels = channelSuggestions.map(
        ({ webhook_channel, webhook_channel_id }) => ({
            displayValue: webhook_channel,
            value: webhook_channel_id,
            id: webhook_channel_id,
        })
    );

    const environments = [
        {
            displayValue: 'production',
            value: 'production',
            id: 'production',
        },
        {
            displayValue: 'staging',
            value: 'staging',
            id: 'staging',
        },
        {
            displayValue: 'development',
            value: 'development',
            id: 'development',
        },
        ...environmentOptions.map(({ name, value }) => ({
            displayValue: name,
            value: name,
            id: value,
        })),
    ];

    const onChannelsChange = (channels: string[]) => {
        form.setFieldsValue({ channels });
        setFormTouched(true);
    };

    const onExcludedEnvironmentsChange = (excludedEnvironments: string[]) => {
        form.setFieldsValue({ excludedEnvironments });
        setFormTouched(true);
    };

    const onThresholdChange = () => {
        setFormTouched(true);
    };

    if (!alert) {
        return null;
    }

    return (
        <Collapsible title={name} className={styles.alertConfigurationCard}>
            <Form
                onFinish={onSubmit}
                form={form}
                initialValues={{
                    threshold: alert.CountThreshold,
                    channels: alert.ChannelsToNotify.map(
                        (channel: any) => channel.webhook_channel_id
                    ),
                    excludedEnvironments: alert.ExcludedEnvironments,
                }}
            >
                <section>
                    <h3>Channels to notify</h3>
                    <p>
                        Pick Slack channels or people to message when an alert
                        is created.
                    </p>
                    <Form.Item name="channels">
                        <Select
                            className={styles.channelSelect}
                            options={channels}
                            mode="multiple"
                            placeholder={`Select a channel(s) or person(s) to send ${name} to.`}
                            onChange={onChannelsChange}
                            notFoundContent={
                                <div>
                                    <h2>Not Found</h2>
                                    <Button>CLick me</Button>
                                </div>
                            }
                            dropdownRender={(menu) => (
                                <div>
                                    {menu}
                                    <Divider style={{ margin: '4px 0' }} />
                                    <div className={styles.addContainer}>
                                        Can't find the channel or person here?{' '}
                                        <a href="">
                                            Configure Highlight with Slack
                                        </a>
                                        .
                                    </div>
                                </div>
                            )}
                        />
                    </Form.Item>
                </section>

                <section>
                    <h3>Excluded environments</h3>
                    <p>
                        Pick environments that should not create alerts. Some
                        teams don't want to be woken up at 2AM if an alert is
                        created from localhost.
                    </p>
                    <Form.Item name="excludedEnvironments">
                        <Select
                            className={styles.channelSelect}
                            options={environments}
                            mode="multiple"
                            placeholder={`Select a environment(s) that should not trigger alerts.`}
                            onChange={onExcludedEnvironmentsChange}
                        />
                    </Form.Item>
                </section>

                {canControlThreshold && (
                    <section>
                        <h3>Threshold</h3>
                        <p>Pick how often an alert should be created.</p>
                        <Form.Item name="threshold">
                            <InputNumber onChange={onThresholdChange} />
                        </Form.Item>
                    </section>
                )}

                <Form.Item shouldUpdate>
                    {() => (
                        <Button
                            type="primary"
                            className={styles.saveButton}
                            htmlType="submit"
                            disabled={!formTouched}
                            loading={loading}
                        >
                            Save
                        </Button>
                    )}
                </Form.Item>
            </Form>
        </Collapsible>
    );
};
