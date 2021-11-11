import Alert from '@components/Alert/Alert';
import Button from '@components/Button/Button/Button';
import Card from '@components/Card/Card';
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import FullBleedCard from '@components/FullBleedCard/FullBleedCard';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import Select from '@components/Select/Select';
import Steps from '@components/Steps/Steps';
import { useCreateDefaultAlertsMutation } from '@graph/hooks';
import { namedOperations } from '@graph/operations';
import SvgXIcon from '@icons/XIcon';
import { ALERT_CONFIGURATIONS, ALERT_NAMES } from '@pages/Alerts/Alerts';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import useLocalStorage from '@rehooks/local-storage';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { Divider } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useSessionStorage } from 'react-use';

const { Step } = Steps;

import styles from './AlertSetupModal.module.scss';

const AlertSetupModal = () => {
    const steps = [
        {
            title: 'Connect Slack',
        },
        {
            title: 'Select Channels',
        },
        { title: 'Select Alert Types' },
    ];

    const [current, setCurrent] = React.useState(0);

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const { loading, alertsPayload, slackUrl } = useAlertsContext();
    const { currentProject } = useApplicationContext();

    useEffect(() => {
        if (current == 0 && alertsPayload?.is_integrated_with_slack === true) {
            setCurrent(current + 1);
        }
    }, [current, alertsPayload?.is_integrated_with_slack, setCurrent]);

    const [selectedChannels, setSelectedChannels] = useSessionStorage<any[]>(
        `HighlightAlertSetupSelectedChannels-${currentProject?.id}`,
        []
    );

    const [channels, setChannels] = useState<
        {
            value: string;
            displayValue: string | React.ReactNode;
            disabled?: boolean;
            id: string;
        }[]
    >([]);

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
                    .map(({ webhook_channel, webhook_channel_id }: any) => ({
                        displayValue: webhook_channel,
                        value: webhook_channel_id,
                        id: webhook_channel_id,
                    }))
            );
        }
    }, [alertsPayload?.slack_channel_suggestion, setChannels]);

    const onChannelsChange = (
        ch: {
            value: string;
            displayValue: string | React.ReactNode;
            disabled?: boolean;
            id: string;
        }[]
    ) => {
        setSelectedChannels(ch);
    };

    const [searchQuery, setSearchQuery] = useState('');

    const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

    const [createDefaultAlerts, {}] = useCreateDefaultAlertsMutation({
        variables: {
            project_id: '',
            alert_types: [],
            slack_channels: [],
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });

    const [shouldCloseSetup, setShouldCloseSetup] = useSessionStorage<boolean>(
        `shouldCloseAlertSetup-${currentProject?.id}`,
        false
    );

    const [
        shouldCloseSetupPersisted,
        setShouldCloseSetupPersisted,
    ] = useLocalStorage<boolean>(
        `shouldCloseAlertSetupPersisted-${currentProject?.id}`,
        false
    );

    useEffect(() => {
        if (
            !loading &&
            (alertsPayload?.error_alerts.length || 0) +
                (alertsPayload?.rage_click_alerts.length || 0) +
                (alertsPayload?.new_user_alerts?.length || 0) +
                (alertsPayload?.user_properties_alerts.length || 0) +
                (alertsPayload?.session_feedback_alerts.length || 0) +
                (alertsPayload?.track_properties_alerts.length || 0) +
                (alertsPayload?.new_session_alerts.length || 0) >
                0
        ) {
            setShouldCloseSetupPersisted(true);
        }
    }, [loading, alertsPayload, setShouldCloseSetupPersisted]);

    if (shouldCloseSetup || shouldCloseSetupPersisted) {
        return null;
    }

    return (
        <FullBleedCard
            title={
                <>
                    <div className={styles.stepsTitle}>
                        {'Default Alert Configuration'}
                    </div>
                    <div
                        className={styles.stepsTitleX}
                        onClick={() => {
                            setShouldCloseSetup(true);
                        }}
                    >
                        <SvgXIcon />
                    </div>
                </>
            }
            className={styles.alertStepsParent}
            childrenClassName={styles.childContent}
        >
            <Steps className={styles.stepsContainer} current={current}>
                {steps.map((item) => (
                    <Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <div className={styles.stepsContent}>
                {current == 0 ? (
                    !loading && (
                        <Alert
                            trackingId="AlertSetupModalSlackIntegration"
                            closable={false}
                            message={"Slack isn't connected"}
                            type={'error'}
                            description={
                                <>
                                    Highlight needs to be connected with Slack
                                    in order to send you and your team messages.
                                    <PersonalNotificationButton
                                        text="Connect Highlight with Slack"
                                        className={styles.integrationButton}
                                        type="Organization"
                                    />
                                </>
                            }
                            className={styles.integrationAlert}
                        />
                    )
                ) : current == 1 ? (
                    <>
                        <h3>Channels to Notify</h3>
                        <p>
                            Pick Slack channels or people to message when an
                            alert is created.
                        </p>
                        <Select
                            className={styles.channelSelect}
                            options={channels}
                            mode="multiple"
                            onSearch={(value) => {
                                setSearchQuery(value);
                            }}
                            filterOption={(searchValue, option) => {
                                return !!option?.children
                                    ?.toString()
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase());
                            }}
                            placeholder={`Select a channel(s) or person(s) to send alerts to.`}
                            onChange={onChannelsChange}
                            defaultValue={selectedChannels}
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
                                        channels or people to sent alerts to.
                                    </div>
                                ) : (
                                    <div
                                        className={classNames(
                                            styles.selectMessage,
                                            styles.notFoundMessage
                                        )}
                                    >
                                        Can't find the channel or person here?{' '}
                                        {currentProject?.id !==
                                            DEMO_WORKSPACE_APPLICATION_ID && (
                                            <a href={slackUrl}>
                                                Sync Highlight with your Slack
                                                Workspace
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
                                                    Can't find the channel or
                                                    person here?{' '}
                                                    {currentProject?.id !==
                                                        DEMO_WORKSPACE_APPLICATION_ID && (
                                                        <a href={slackUrl}>
                                                            Sync Highlight with
                                                            your Slack Workspace
                                                        </a>
                                                    )}
                                                    .
                                                </div>
                                            </>
                                        )}
                                </div>
                            )}
                        />
                    </>
                ) : (
                    <div className={styles.cardGrid}>
                        {Object.keys(ALERT_CONFIGURATIONS).map((_key) => {
                            const key = _key as keyof typeof ALERT_CONFIGURATIONS;
                            const configuration = ALERT_CONFIGURATIONS[key];
                            const alertColor = getAlertTypeColor(
                                configuration.name
                            );

                            if (
                                configuration.name ===
                                    `${ALERT_NAMES.TRACK_PROPERTIES_ALERT}` ||
                                configuration.name ===
                                    `${ALERT_NAMES.USER_PROPERTIES_ALERT}`
                            ) {
                                return null;
                            }
                            const cx = classNames.bind(styles);

                            return (
                                <div
                                    className={styles.cardContent}
                                    key={key}
                                    onClick={() => {
                                        if (selectedAlerts.includes(key)) {
                                            setSelectedAlerts(
                                                selectedAlerts.filter(
                                                    (predicate) => {
                                                        return (
                                                            predicate !== key
                                                        );
                                                    }
                                                )
                                            );
                                        } else {
                                            setSelectedAlerts([
                                                ...selectedAlerts,
                                                key,
                                            ]);
                                        }
                                    }}
                                >
                                    <Card
                                        className={cx(styles.cardContainer, {
                                            [styles.alertTypeSelected]: selectedAlerts.includes(
                                                key
                                            ),
                                        })}
                                    >
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
                                            {
                                                ALERT_CONFIGURATIONS[key]
                                                    .description
                                            }
                                        </p>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className={styles.stepsAction}>
                {current === steps.length - 2 && (
                    <Button
                        type="primary"
                        trackingId="track"
                        onClick={() => next()}
                    >
                        Next Step
                    </Button>
                )}
                {current === steps.length - 1 && (
                    <Button
                        type="primary"
                        trackingId="track"
                        disabled={
                            selectedChannels.length < 1 ||
                            selectedAlerts.length < 1
                        }
                        onClick={() => {
                            createDefaultAlerts({
                                variables: {
                                    project_id: currentProject!.id,
                                    slack_channels: channels
                                        .filter((predicate) => {
                                            return selectedChannels.includes(
                                                predicate.id
                                            );
                                        })
                                        .map((value) => ({
                                            webhook_channel_id: `${value.value}`,
                                            webhook_channel_name: `${value.displayValue}`,
                                        })),
                                    alert_types: selectedAlerts,
                                },
                            });
                        }}
                    >
                        Create Alerts
                    </Button>
                )}
                {current > 1 && (
                    <Button
                        trackingId="track"
                        style={{ margin: '0 8px' }}
                        onClick={() => prev()}
                    >
                        Previous
                    </Button>
                )}
            </div>
        </FullBleedCard>
    );
};

export default AlertSetupModal;
