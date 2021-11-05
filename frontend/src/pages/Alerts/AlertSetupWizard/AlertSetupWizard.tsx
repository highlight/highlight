import Alert from '@components/Alert/Alert';
import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import FullBleedCard from '@components/FullBleedCard/FullBleedCard';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import SvgXIcon from '@icons/XIcon';
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { Divider, Form, Select } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useSessionStorage } from 'react-use';

import styles from './AlertSetupWizard.module.scss';

const AlertSetupWizard = () => {
    const { currentProject } = useApplicationContext();

    const [wizardState, setWizardState] = useSessionStorage(
        `HighlightAlerSetupWizardState-${currentProject?.id}`,
        0
    );

    const [searchQuery, setSearchQuery] = useState('');
    const { alertsPayload } = useAlertsContext();

    useEffect(() => {
        console.log('ooga booga here');
    }, [wizardState]);

    useEffect(() => {
        if (
            wizardState == 0 &&
            alertsPayload?.is_integrated_with_slack == true
        ) {
            setWizardState(1);
        }
    }, [wizardState, alertsPayload?.is_integrated_with_slack, setWizardState]);

    const getStep = (wizardState: number) => {
        switch (wizardState) {
            case 0:
                return <ConnectToSlackStep />;
            case 1:
                return <SelectAChannelStep />;
            case 2:
                return <SelectAlertTypesStep />;
        }
    };

    const ConnectToSlackStep = () => {
        return (
            <>
                <Alert
                    trackingId="AlertSetupWizardSlackIntegration"
                    closable={false}
                    message={"Slack isn't connected"}
                    type={'error'}
                    description={
                        <>
                            Highlight needs to be connected with Slack in order
                            to send you and your team messages.
                            <PersonalNotificationButton
                                text="Connect Highlight with Slack"
                                className={styles.integrationButton}
                                type="Organization"
                            />
                        </>
                    }
                    className={styles.integrationAlert}
                />
            </>
        );
    };

    const SelectAChannelStep = () => {
        const [formTouched, setFormTouched] = useState(false);

        const [, setWizardState] = useSessionStorage(
            `HighlightAlerSetupWizardState-${currentProject?.id}`,
            0
        );
        const [selectedChannels, setSelectedChannels] = useSessionStorage<
            {
                value: any;
                id: any;
                label: string;
            }[]
        >(`HighlightAlertSetupSelectedChannels-${currentProject?.id}`, []);

        const [channels, setChannels] = useState<
            {
                value: any;
                id: any;
                label: string;
            }[]
        >([]);
        const { alertsPayload, slackUrl } = useAlertsContext();
        useEffect(() => {
            if (!!alertsPayload?.slack_channel_suggestion) {
                setChannels(
                    alertsPayload.slack_channel_suggestion
                        .filter((predicate) => {
                            return (
                                predicate?.webhook_channel &&
                                predicate.webhook_channel_id
                            );
                        })
                        .map(
                            ({ webhook_channel, webhook_channel_id }: any) => ({
                                label: webhook_channel,
                                value: webhook_channel_id,
                                id: webhook_channel_id,
                            })
                        )
                );
            }
        }, [alertsPayload?.slack_channel_suggestion, setChannels]);

        const [form] = Form.useForm();

        let ch: any[];
        const onChannelsChange = (
            channels: { label: any; value: any; id: any }[]
        ) => {
            ch = channels;
            form.setFieldsValue(channels);
            setFormTouched(true);
        };

        const onSubmit = async () => {
            if (ch) {
                setSelectedChannels(ch);
                setWizardState(2);
            }
        };

        return (
            <>
                <Form
                    form={form}
                    key={'alertSetupChannelSelectionStep-' + currentProject?.id}
                    onFinish={onSubmit}
                >
                    <h3>Channels to Notify</h3>
                    <p>
                        Pick Slack channels or people to message when an alert
                        is created.
                    </p>
                    <Form.Item shouldUpdate>
                        {() => (
                            <Select
                                labelInValue
                                className={styles.channelSelect}
                                options={channels}
                                defaultValue={selectedChannels}
                                mode="multiple"
                                onSearch={(value) => {
                                    setSearchQuery(value);
                                }}
                                filterOption={(searchValue, option) => {
                                    return !!option?.label
                                        ?.toString()
                                        .toLowerCase()
                                        .includes(searchValue.toLowerCase());
                                }}
                                placeholder={`Select a channel(s) or person(s) to send alerts to.`}
                                onChange={onChannelsChange}
                                notFoundContent={
                                    channels?.length === 0 ? (
                                        <div
                                            className={classNames(
                                                styles.selectMessage,
                                                styles.notFoundMessage
                                            )}
                                        >
                                            Slack is not configured yet.{' '}
                                            <a href={slackUrl}>
                                                Click here to sync with Slack
                                            </a>
                                            . After syncing, you can pick the
                                            channels or people to sent alerts
                                            to.
                                        </div>
                                    ) : (
                                        <div
                                            className={classNames(
                                                styles.selectMessage,
                                                styles.notFoundMessage
                                            )}
                                        >
                                            Can't find the channel or person
                                            here?{' '}
                                            {currentProject?.id !==
                                                DEMO_WORKSPACE_APPLICATION_ID && (
                                                <a href={slackUrl}>
                                                    Sync Highlight with your
                                                    Slack Workspace
                                                </a>
                                            )}
                                            .
                                        </div>
                                    )
                                }
                                dropdownRender={(menu) => (
                                    <div>
                                        {menu}
                                        {searchQuery.length === 0 &&
                                            channels.length > 0 && (
                                                <>
                                                    <Divider
                                                        style={{
                                                            margin: '4px 0',
                                                        }}
                                                    />
                                                    <div
                                                        className={
                                                            styles.addContainer
                                                        }
                                                    >
                                                        Can't find the channel
                                                        or person here?{' '}
                                                        {currentProject?.id !==
                                                            DEMO_WORKSPACE_APPLICATION_ID && (
                                                            <a href={slackUrl}>
                                                                Sync Highlight
                                                                with your Slack
                                                                Workspace
                                                            </a>
                                                        )}
                                                        .
                                                    </div>
                                                </>
                                            )}
                                    </div>
                                )}
                            />
                        )}
                    </Form.Item>
                    <Form.Item shouldUpdate>
                        {() => (
                            <div className={styles.actionsContainer}>
                                <Button
                                    trackingId="SaveAlertSetupChannels"
                                    type="primary"
                                    className={styles.saveButton}
                                    htmlType="submit"
                                    disabled={!formTouched && !selectedChannels}
                                >
                                    {'next step'}
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </>
        );
    };

    const SelectAlertTypesStep = () => {
        return (
            <div className={styles.cardGrid}>
                {Object.keys(ALERT_CONFIGURATIONS).map((_key) => {
                    const key = _key as keyof typeof ALERT_CONFIGURATIONS;
                    const configuration = ALERT_CONFIGURATIONS[key];
                    const alertColor = getAlertTypeColor(configuration.name);

                    const cx = classNames.bind(styles);

                    return (
                        <div className={styles.cardContent} key={key}>
                            <Card className={cx(styles.cardContainer)}>
                                <h2 id={styles.title}>
                                    <span
                                        className={styles.icon}
                                        style={{
                                            backgroundColor: alertColor,
                                        }}
                                    >
                                        {ALERT_CONFIGURATIONS[key].icon}
                                    </span>
                                    {ALERT_CONFIGURATIONS[key].name}
                                </h2>
                                <p className={styles.description}>
                                    {ALERT_CONFIGURATIONS[key].description}
                                </p>
                            </Card>
                        </div>
                    );
                })}
            </div>
        );
    };

    const cx = classNames.bind(styles);

    return (
        <FullBleedCard
            className={styles.alertStepsParent}
            childrenClassName={styles.childContent}
            closeIcon={<SvgXIcon />}
        >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.alertStepsHeader}>
                    <div
                        className={cx(styles.fullBleedAlertSetupStep, {
                            [styles.selected]: wizardState == 0,
                        })}
                        onClick={() => setWizardState(0)}
                    >
                        Connect to slack
                    </div>
                    <div
                        className={cx(styles.fullBleedAlertSetupStep, {
                            [styles.selected]: wizardState == 1,
                        })}
                        onClick={() => setWizardState(1)}
                    >
                        Select a channel
                    </div>
                    <div
                        className={cx(styles.fullBleedAlertSetupStep, {
                            [styles.selected]: wizardState == 2,
                        })}
                        onClick={() => setWizardState(2)}
                    >
                        Select alert types
                    </div>
                </div>
                {getStep(wizardState)}
            </div>
        </FullBleedCard>
    );
};

export default AlertSetupWizard;
