import Card from '@components/Card/Card';
import { DEMO_WORKSPACE_APPLICATION_ID } from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import Input from '@components/Input/Input';
import { namedOperations } from '@graph/operations';
import { useParams } from '@util/react-router/useParams';
import { Divider, Form, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import TextTransition from 'react-text-transition';

import Button from '../../../components/Button/Button/Button';
import InputNumber from '../../../components/InputNumber/InputNumber';
import layoutStyles from '../../../components/layout/LeadAlignLayout.module.scss';
import Select from '../../../components/Select/Select';
import {
    useCreateErrorAlertMutation,
    useCreateNewSessionAlertMutation,
    useCreateNewUserAlertMutation,
    useCreateRageClickAlertMutation,
    useCreateSessionFeedbackAlertMutation,
    useCreateTrackPropertiesAlertMutation,
    useCreateUserPropertiesAlertMutation,
    useGetTrackSuggestionQuery,
    useGetUserSuggestionQuery,
    useUpdateErrorAlertMutation,
    useUpdateNewSessionAlertMutation,
    useUpdateNewUserAlertMutation,
    useUpdateRageClickAlertMutation,
    useUpdateSessionFeedbackAlertMutation,
    useUpdateTrackPropertiesAlertMutation,
    useUpdateUserPropertiesAlertMutation,
} from '../../../graph/generated/hooks';
import { ALERT_TYPE } from '../Alerts';
import { dedupeEnvironments, getAlertTypeColor } from '../utils/AlertsUtils';
import styles from './AlertConfigurationCard.module.scss';

interface AlertConfiguration {
    name: string;
    canControlThreshold: boolean;
    type: ALERT_TYPE;
    description?: string;
}

interface Props {
    alert: any;
    configuration: AlertConfiguration;
    environmentOptions: any[];
    channelSuggestions: any[];
    slackUrl: string;
    onDeleteHandler?: (alertId: string) => void;
    isCreatingNewAlert?: boolean;
}

export const AlertConfigurationCard = ({
    alert,
    configuration: {
        name: defaultName,
        canControlThreshold,
        type,
        description,
    },
    environmentOptions,
    channelSuggestions,
    slackUrl,
    onDeleteHandler,
    isCreatingNewAlert = false,
}: Props) => {
    const [loading, setLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [threshold, setThreshold] = useState(alert?.CountThreshold || 1);
    /** lookbackPeriod units is minutes. */
    const [lookbackPeriod, setLookbackPeriod] = useState(
        getLookbackPeriodOption(alert?.ThresholdWindow).value
    );
    const [searchQuery, setSearchQuery] = useState('');
    const { project_id } = useParams<{ project_id: string }>();
    const [form] = Form.useForm();
    const [updateErrorAlert] = useUpdateErrorAlertMutation();
    const [updateNewUserAlert] = useUpdateNewUserAlertMutation();
    const [updateUserPropertiesAlert] = useUpdateUserPropertiesAlertMutation();
    const history = useHistory();
    const [createErrorAlert, {}] = useCreateErrorAlertMutation({
        variables: {
            project_id,
            count_threshold: 1,
            environments: [],
            slack_channels: [],
            threshold_window: 30,
            name: 'Error',
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [
        createSessionFeedbackAlert,
        {},
    ] = useCreateSessionFeedbackAlertMutation({
        variables: {
            project_id,
            count_threshold: 1,
            environments: [],
            slack_channels: [],
            threshold_window: 30,
            name: 'Session Feedback',
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [createNewUserAlert, {}] = useCreateNewUserAlertMutation({
        variables: {
            project_id,
            count_threshold: 1,
            environments: [],
            slack_channels: [],
            name: 'New User',
            threshold_window: 1,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [createRageClickAlert, {}] = useCreateRageClickAlertMutation({
        variables: {
            project_id,
            count_threshold: 1,
            environments: [],
            slack_channels: [],
            name: 'Rage Click',
            threshold_window: 30,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [createNewSessionAlert, {}] = useCreateNewSessionAlertMutation({
        variables: {
            project_id,
            count_threshold: 1,
            environments: [],
            slack_channels: [],
            name: 'New Session',
            threshold_window: 1,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [
        createTrackPropertiesAlert,
        {},
    ] = useCreateTrackPropertiesAlertMutation({
        variables: {
            project_id,
            environments: [],
            slack_channels: [],
            name: 'Track',
            track_properties: [],
            threshold_window: 1,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [
        createUserPropertiesAlert,
        {},
    ] = useCreateUserPropertiesAlertMutation({
        variables: {
            project_id,
            environments: [],
            slack_channels: [],
            name: 'User',
            user_properties: [],
            threshold_window: 1,
        },
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [
        updateTrackPropertiesAlert,
    ] = useUpdateTrackPropertiesAlertMutation();
    const [
        updateSessionFeedbackAlert,
    ] = useUpdateSessionFeedbackAlertMutation();
    const [updateRageClickAlert] = useUpdateRageClickAlertMutation();
    const [updateNewSessionAlert] = useUpdateNewSessionAlertMutation();

    const excludedEnvironmentsFormName = `${
        alert.Name || defaultName
    }-excludedEnvironments`;

    useEffect(() => {
        history.replace(history.location.pathname, {
            errorName: alert.Name || defaultName,
        });
    }, [alert.Name, defaultName, history]);

    const onSubmit = async () => {
        const requestVariables = {
            project_id,
            environments: form.getFieldValue(excludedEnvironmentsFormName),
            count_threshold: form.getFieldValue('threshold'),
            slack_channels: form
                .getFieldValue('channels')
                .map((webhook_channel_id: string) => ({
                    webhook_channel_name: channelSuggestions.find(
                        (suggestion) =>
                            suggestion.webhook_channel_id === webhook_channel_id
                    ).webhook_channel,
                    webhook_channel_id,
                })),
            name: form.getFieldValue('name'),
        };
        const requestBody = {
            refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
        };
        setLoading(true);
        if (isCreatingNewAlert) {
            try {
                switch (type) {
                    case ALERT_TYPE.Error:
                        await createErrorAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: lookbackPeriod,
                            },
                        });
                        break;
                    case ALERT_TYPE.FirstTimeUser:
                        await createNewUserAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.NewSession:
                        await createNewSessionAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.RageClick:
                        await createRageClickAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: lookbackPeriod,
                            },
                        });
                        break;
                    case ALERT_TYPE.SessionFeedbackComment:
                        await createSessionFeedbackAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.TrackProperties:
                        await createTrackPropertiesAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: 1,
                                track_properties: form
                                    .getFieldValue('trackProperties')
                                    .map((trackProperty: any) => {
                                        const [
                                            value,
                                            name,
                                            id,
                                        ] = trackProperty.split(':');
                                        return {
                                            id,
                                            value,
                                            name,
                                        };
                                    }),
                            },
                        });
                        break;
                    case ALERT_TYPE.UserProperties:
                        await createUserPropertiesAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                threshold_window: 1,
                                user_properties: form
                                    .getFieldValue('userProperties')
                                    .map((userProperty: any) => {
                                        const [
                                            value,
                                            name,
                                            id,
                                        ] = userProperty.split(':');
                                        return {
                                            id,
                                            value,
                                            name,
                                        };
                                    }),
                            },
                        });
                        break;
                }
                message.success(`Created ${requestVariables.name} alert!`);
                history.push(`/${project_id}/alerts`);
            } catch (e) {
                console.log(e);
            }
        } else {
            try {
                switch (type) {
                    case ALERT_TYPE.Error:
                        await updateErrorAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                error_alert_id: alert.id,
                                threshold_window: lookbackPeriod,
                            },
                        });
                        break;
                    case ALERT_TYPE.FirstTimeUser:
                        await updateNewUserAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                session_alert_id: alert.id,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.UserProperties:
                        await updateUserPropertiesAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                user_properties: form
                                    .getFieldValue('userProperties')
                                    .map((userProperty: any) => {
                                        const [
                                            value,
                                            name,
                                            id,
                                        ] = userProperty.split(':');
                                        return {
                                            id,
                                            value,
                                            name,
                                        };
                                    }),
                                session_alert_id: alert.id,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.TrackProperties:
                        await updateTrackPropertiesAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                track_properties: form
                                    .getFieldValue('trackProperties')
                                    .map((trackProperty: any) => {
                                        const [
                                            value,
                                            name,
                                            id,
                                        ] = trackProperty.split(':');
                                        return {
                                            id,
                                            value,
                                            name,
                                        };
                                    }),
                                session_alert_id: alert.id,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.SessionFeedbackComment:
                        await updateSessionFeedbackAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                session_feedback_alert_id: alert.id,
                                threshold_window: lookbackPeriod,
                            },
                        });
                        break;
                    case ALERT_TYPE.NewSession:
                        await updateNewSessionAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                session_alert_id: alert.id,
                                threshold_window: 1,
                            },
                        });
                        break;
                    case ALERT_TYPE.RageClick:
                        await updateRageClickAlert({
                            ...requestBody,
                            variables: {
                                ...requestVariables,
                                rage_click_alert_id: alert.id,
                                threshold_window: lookbackPeriod,
                            },
                        });
                        break;
                    default:
                        throw new Error(`Unsupported alert type: ${type}`);
                }
                message.success(`Updated ${defaultName}!`);
            } catch (e) {
                message.error(
                    `There was a problem updating ${defaultName}. Please try again.`
                );
            }
        }
        setFormTouched(false);
        setLoading(false);
    };

    const {
        data: userSuggestionsApiResponse,
        loading: userSuggestionsLoading,
        refetch: refetchUserSuggestions,
    } = useGetUserSuggestionQuery({
        variables: {
            project_id,
            query: '',
        },
    });

    const {
        refetch: refetchTrackSuggestions,
        loading: trackSuggestionsLoading,
        data: trackSuggestionsApiResponse,
    } = useGetTrackSuggestionQuery({
        variables: {
            project_id,
            query: '',
        },
    });

    const channels = channelSuggestions.map(
        ({ webhook_channel, webhook_channel_id }) => ({
            displayValue: webhook_channel,
            value: webhook_channel_id,
            id: webhook_channel_id,
        })
    );

    const environments = [
        ...dedupeEnvironments(environmentOptions).map(
            (environmentSuggestion) => ({
                displayValue: environmentSuggestion,
                value: environmentSuggestion,
                id: environmentSuggestion,
            })
        ),
    ];

    const userPropertiesSuggestions = userSuggestionsLoading
        ? []
        : (
              userSuggestionsApiResponse?.property_suggestion || []
          ).map((suggestion) => getPropertiesOption(suggestion));

    const trackPropertiesSuggestions = trackSuggestionsLoading
        ? []
        : (
              trackSuggestionsApiResponse?.property_suggestion || []
          ).map((suggestion) => getPropertiesOption(suggestion));

    /** Searches for a user property  */
    const handleUserPropertiesSearch = (query = '') => {
        refetchUserSuggestions({ query, project_id });
    };

    const handleTrackPropertiesSearch = (query = '') => {
        refetchTrackSuggestions({ query, project_id });
    };

    const onChannelsChange = (channels: string[]) => {
        form.setFieldsValue({ channels });
        setFormTouched(true);
    };

    const onUserPropertiesChange = (_value: any, options: any) => {
        const userProperties = options.map(
            ({ value: valueAndName }: { key: string; value: string }) => {
                const [value, name, id] = valueAndName.split(':');
                return {
                    id,
                    value,
                    name,
                };
            }
        );
        form.setFieldsValue(userProperties);
        setFormTouched(true);
    };

    const onTrackPropertiesChange = (_value: any, options: any) => {
        const trackProperties = options.map(
            ({ value: valueAndName }: { key: string; value: string }) => {
                const [value, name, id] = valueAndName.split(':');
                return {
                    id,
                    value,
                    name,
                };
            }
        );
        form.setFieldsValue(trackProperties);
        setFormTouched(true);
    };

    const onExcludedEnvironmentsChange = (excludedEnvironments: string[]) => {
        form.setFieldsValue({ excludedEnvironments });
        setFormTouched(true);
    };

    const onThresholdChange = (threshold: any) => {
        setThreshold(threshold);
        setFormTouched(true);
    };

    const onLookbackPeriodChange = (
        _lookbackPeriod: any,
        lookbackPeriodOption: any
    ) => {
        setLookbackPeriod(lookbackPeriodOption.value);
        setFormTouched(true);
    };

    if (!alert) {
        return null;
    }

    return (
        <div className={styles.alertConfigurationCard}>
            <p className={classNames(layoutStyles.subTitle, styles.subTitle)}>
                This is an{' '}
                <strong style={{ color: getAlertTypeColor(defaultName) }}>
                    {defaultName}
                </strong>{' '}
                alert. {description}
            </p>

            <Card>
                <Form
                    onFinish={onSubmit}
                    form={form}
                    initialValues={{
                        threshold: alert.CountThreshold,
                        channels:
                            alert.ChannelsToNotify?.map(
                                (channel: any) => channel.webhook_channel_id
                            ) || [],
                        [excludedEnvironmentsFormName]:
                            alert.ExcludedEnvironments,
                        lookbackPeriod: [lookbackPeriod],
                        userProperties: alert.UserProperties?.map(
                            (userProperty: any) =>
                                getPropertiesOption(userProperty).value
                        ),
                        trackProperties: alert.TrackProperties?.map(
                            (trackProperty: any) =>
                                getPropertiesOption(trackProperty).value
                        ),
                        name: alert.Name || defaultName,
                    }}
                    key={project_id}
                >
                    <section>
                        <h3>Name</h3>
                        <p>You can change the name of the alert anytime.</p>
                        <Form.Item name="name" required>
                            <Input
                                size="large"
                                onChange={() => {
                                    setFormTouched(true);
                                }}
                            />
                        </Form.Item>
                    </section>
                    {type === ALERT_TYPE.UserProperties && (
                        <section>
                            <h3>User Properties</h3>
                            <p>
                                Pick the user properties that you would like to
                                get alerted for.
                            </p>
                            <Form.Item name="userProperties">
                                <Select
                                    onSearch={handleUserPropertiesSearch}
                                    className={styles.channelSelect}
                                    options={userPropertiesSuggestions}
                                    mode="multiple"
                                    placeholder={`Pick the user properties that you would like to get alerted for.`}
                                    onChange={onUserPropertiesChange}
                                />
                            </Form.Item>
                        </section>
                    )}
                    {type === ALERT_TYPE.TrackProperties && (
                        <section>
                            <h3>Track Properties</h3>
                            <p>
                                Pick the track properties that you would like to
                                get alerted for.
                            </p>
                            <Form.Item name="trackProperties">
                                <Select
                                    onSearch={handleTrackPropertiesSearch}
                                    className={styles.channelSelect}
                                    options={trackPropertiesSuggestions}
                                    mode="multiple"
                                    placeholder={`Pick the track properties that you would like to get alerted for.`}
                                    onChange={onTrackPropertiesChange}
                                />
                            </Form.Item>
                        </section>
                    )}
                    <section>
                        <h3>Channels to Notify</h3>
                        <p>
                            Pick Slack channels or people to message when an
                            alert is created.
                        </p>
                        <Form.Item shouldUpdate>
                            {() => (
                                <Select
                                    className={styles.channelSelect}
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
                                    placeholder={`Select a channel(s) or person(s) to send ${defaultName} to.`}
                                    onChange={onChannelsChange}
                                    notFoundContent={
                                        channelSuggestions?.length === 0 ? (
                                            <div
                                                className={classNames(
                                                    styles.selectMessage,
                                                    styles.notFoundMessage
                                                )}
                                            >
                                                Slack is not configured yet.{' '}
                                                <a href={slackUrl}>
                                                    Click here to sync with
                                                    Slack
                                                </a>
                                                . After syncing, you can pick
                                                the channels or people to sent
                                                alerts to.
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
                                                {project_id !==
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
                                    defaultValue={alert?.ChannelsToNotify?.map(
                                        (channel: any) =>
                                            channel.webhook_channel_id
                                    )}
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
                                                                styles.addContainer
                                                            }
                                                        >
                                                            Can't find the
                                                            channel or person
                                                            here?{' '}
                                                            {project_id !==
                                                                DEMO_WORKSPACE_APPLICATION_ID && (
                                                                <a
                                                                    href={
                                                                        slackUrl
                                                                    }
                                                                >
                                                                    Sync
                                                                    Highlight
                                                                    with your
                                                                    Slack
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
                    </section>

                    <section>
                        <h3>Excluded Environments</h3>
                        <p>
                            Pick environments that should not create alerts.
                            Some teams don't want to be woken up at 2AM if an
                            alert is created from localhost. Environments can be
                            set by passing the environment name when you{' '}
                            <a
                                href="https://docs.highlight.run/api#w0-highlightoptions"
                                target="_blank"
                                rel="noreferrer"
                            >
                                start Highlight in your app
                            </a>
                            .
                        </p>
                        <Form.Item name={excludedEnvironmentsFormName}>
                            <Select
                                className={styles.channelSelect}
                                options={environments}
                                mode="tags"
                                placeholder={`Select a environment(s) that should not trigger alerts.`}
                                onChange={onExcludedEnvironmentsChange}
                            />
                        </Form.Item>
                    </section>

                    {canControlThreshold && (
                        <>
                            <section>
                                <h3>Threshold</h3>
                                {threshold <= 0 ? (
                                    <p>{`Setting the threshold to ${threshold} means no alerts will be created.`}</p>
                                ) : (
                                    <>
                                        <span>
                                            An alert will be created if{' '}
                                            <b>
                                                <TextTransition
                                                    text={`${threshold}`}
                                                    inline
                                                />{' '}
                                                {defaultName.toLocaleLowerCase()}
                                            </b>{' '}
                                            happens in a{' '}
                                            <b>
                                                <TextTransition
                                                    inline
                                                    text={`${
                                                        getLookbackPeriodOption(
                                                            lookbackPeriod
                                                        ).displayValue.slice(
                                                            0,
                                                            -1
                                                        ) ||
                                                        `${DEFAULT_LOOKBACK_PERIOD} minute`
                                                    }`}
                                                />
                                            </b>{' '}
                                            window.
                                        </span>
                                    </>
                                )}
                                <div className={styles.frequencyContainer}>
                                    <Form.Item name="threshold">
                                        <InputNumber
                                            onChange={onThresholdChange}
                                            min={0}
                                        />
                                    </Form.Item>
                                    <Form.Item name="lookbackPeriod">
                                        <Select
                                            className={
                                                styles.lookbackPeriodSelect
                                            }
                                            onChange={onLookbackPeriodChange}
                                            options={LOOKBACK_PERIODS}
                                        />
                                    </Form.Item>
                                </div>
                            </section>
                        </>
                    )}

                    <Form.Item shouldUpdate>
                        {() => (
                            <div className={styles.actionsContainer}>
                                {onDeleteHandler && (
                                    <Button
                                        trackingId="DeleteAlertConfiguration"
                                        type="default"
                                        danger
                                        className={styles.saveButton}
                                        htmlType="button"
                                        loading={loading}
                                        onClick={() => {
                                            if (alert.id) {
                                                onDeleteHandler(alert.id);
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    trackingId="SaveAlertConfiguration"
                                    type="primary"
                                    className={styles.saveButton}
                                    htmlType="submit"
                                    disabled={!formTouched}
                                    loading={loading}
                                >
                                    {isCreatingNewAlert ? 'Create' : 'Save'}
                                </Button>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

const LOOKBACK_PERIODS = [
    {
        displayValue: '5 minutes',
        value: '5',
        id: '5m',
    },
    {
        displayValue: '10 minutes',
        value: '10',
        id: '10m',
    },
    {
        displayValue: '30 minutes',
        value: '30',
        id: '30m',
    },
    {
        displayValue: '60 minutes',
        value: '60',
        id: '60m',
    },
    {
        displayValue: '3 hours',
        value: `${60 * 3}`,
        id: '3h',
    },
    {
        displayValue: '12 hours',
        value: `${60 * 12}`,
        id: '12h',
    },
    {
        displayValue: '24 hours',
        value: `${60 * 24}`,
        id: '24h',
    },
];

const DEFAULT_LOOKBACK_PERIOD = '30';

const getLookbackPeriodOption = (minutes = DEFAULT_LOOKBACK_PERIOD): any => {
    const option = LOOKBACK_PERIODS.find(
        (option) => option.value === minutes?.toString()
    );

    if (!option) {
        return {
            displayValue: '30 minutes',
            value: '30',
            id: '30m',
        };
    }

    return option;
};

const getPropertiesOption = (option: any) => ({
    displayValue:
        (
            <>
                <b>{option?.name}: </b>
                {option?.value}
            </>
        ) || '',
    value: `${option?.value}:${option?.name}:${option?.id}` || '',
    id: `${option?.value}:${option?.name}` || '',
    name: option?.id || '',
});
