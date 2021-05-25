import { Form } from 'antd';
import React from 'react';

import Button from '../../../components/Button/Button/Button';
import Collapsible from '../../../components/Collapsible/Collapsible';
import InputNumber from '../../../components/InputNumber/InputNumber';
import Select from '../../../components/Select/Select';
import styles from './AlertConfigurationCard.module.scss';

interface AlertConfiguration {
    name: string;
    canControlThreshold: boolean;
}

interface Props {
    configuration: AlertConfiguration;
}

export const AlertConfigurationCard = ({
    configuration: { name, canControlThreshold },
}: Props) => {
    const [form] = Form.useForm();

    const onSubmit = (data: any) => {
        console.log({ ...data, name });
    };

    const channels = [
        {
            displayValue: '#boba',
            value: '#boba',
            id: '#boba',
        },
        {
            displayValue: '#mochi',
            value: '#mochi',
            id: '0',
        },
        {
            displayValue: '#phamous',
            value: '#phamous',
            id: '2',
        },
    ];

    const environments = [
        {
            displayValue: 'production',
            value: '#boba',
            id: '#boba',
        },
        {
            displayValue: 'staging',
            value: '#mochi',
            id: '0',
        },
        {
            displayValue: 'development',
            value: '#phamous',
            id: '2',
        },
        {
            displayValue: "jay's laptop",
            value: '#laptop',
            id: '3',
        },
    ];

    const onChannelsChange = (channels: string[]) => {
        form.setFieldsValue({ channels });
    };

    const onExcludedEnvironmentsChange = (excludedEnvironments: string[]) => {
        form.setFieldsValue({ excludedEnvironments });
    };

    return (
        <Collapsible title={name} className={styles.alertConfigurationCard}>
            <Form
                onFinish={onSubmit}
                form={form}
                initialValues={{
                    threshold: 1,
                    channels: [],
                    excludedEnvironments: [],
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
                            mode="tags"
                            placeholder={`Select a channel(s) or person(s) to send ${name} to.`}
                            onChange={onChannelsChange}
                            notFoundContent={
                                <div>
                                    <h2>Not Found</h2>
                                    <Button>CLick me</Button>
                                </div>
                            }
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
                            notFoundContent={
                                <div>
                                    <h2>Not Found</h2>
                                    <Button>CLick me</Button>
                                </div>
                            }
                        />
                    </Form.Item>
                </section>

                {canControlThreshold && (
                    <section>
                        <h3>Threshold</h3>
                        <p>Pick how often an alert should be created.</p>
                        <Form.Item name="threshold">
                            <InputNumber />
                        </Form.Item>
                    </section>
                )}

                <Form.Item shouldUpdate>
                    {() => (
                        <Button
                            type="primary"
                            className={styles.saveButton}
                            htmlType="submit"
                            disabled={!form.isFieldsTouched(false)}
                        >
                            Save
                        </Button>
                    )}
                </Form.Item>
            </Form>
        </Collapsible>
    );
};
