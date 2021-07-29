import { Divider, Form, message } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TextTransition from 'react-text-transition';

import Button from '../../../components/Button/Button/Button';
import Collapsible from '../../../components/Collapsible/Collapsible';
import InfoTooltip from '../../../components/InfoTooltip/InfoTooltip';
import InputNumber from '../../../components/InputNumber/InputNumber';
import Select from '../../../components/Select/Select';
import {
    useGetTrackSuggestionQuery,
    useGetUserSuggestionQuery,
    useUpdateErrorAlertMutation,
    useUpdateNewUserAlertMutation,
    useUpdateTrackPropertiesAlertMutation,
    useUpdateUserPropertiesAlertMutation,
} from '../../../graph/generated/hooks';
import { ALERT_TYPE } from '../Alerts';
import { dedupeEnvironments } from '../utils/AlertsUtils';
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
}

export const AlertConfigurationCard = ({
    alert,
    configuration: { name, canControlThreshold, type, description },
    environmentOptions,
    channelSuggestions,
    slackUrl,
}: Props) => {
    const [loading, setLoading] = useState(false);
    const [formTouched, setFormTouched] = useState(false);
    const [threshold, setThreshold] = useState(alert?.CountThreshold || 1);
    /** lookbackPeriod units is minutes. */
    const [lookbackPeriod, setLookbackPeriod] = useState(
        getLookbackPeriodOption(alert?.ThresholdWindow).value
    );
    const { organization_id } = useParams<{ organization_id: string }>();
    const [form] = Form.useForm();
    const [updateErrorAlert] = useUpdateErrorAlertMutation();
    const [updateNewUserAlert] = useUpdateNewUserAlertMutation();
    const [updateUserPropertiesAlert] = useUpdateUserPropertiesAlertMutation();
    const [
        updateTrackPropertiesAlert,
    ] = useUpdateTrackPropertiesAlertMutation();

    const onSubmit = async () => {
        setLoading(true);
        try {
            const requestVariables = {
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
            };
            const requestBody = {
                refetchQueries: ['GetAlertsPagePayload'],
            };

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
                        },
                    });
                    break;
                default:
                    throw new Error(`Unsupported alert type: ${type}`);
            }
            message.success(`Updated ${name}!`);
            setFormTouched(false);
        } catch (e) {
            message.error(
                `There was a problem updating ${name}. Please try again.`
            );
        }
        setLoading(false);
    };

    const {
        data: userSuggestionsApiResponse,
        loading: userSuggestionsLoading,
        refetch: refetchUserSuggestions,
    } = useGetUserSuggestionQuery({
        variables: {
            organization_id,
            query: '',
        },
    });

    const {
        refetch: refetchTrackSuggestions,
        loading: trackSuggestionsLoading,
        data: trackSuggestionsApiResponse,
    } = useGetTrackSuggestionQuery({
        variables: {
            organization_id,
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
        refetchUserSuggestions({ query, organization_id });
    };

    const handleTrackPropertiesSearch = (query = '') => {
        refetchTrackSuggestions({ query, organization_id });
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
        const trackProperties = options
            .filter((option: any) => !!option)
            .map(({ value: valueAndName }: { key: string; value: string }) => {
                const [value, name, id] = valueAndName.split(':');
                return {
                    id,
                    value,
                    name,
                };
            });
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
        <Collapsible
            title={
                <span className={styles.title}>
                    {name} {description && <InfoTooltip title={description} />}
                </span>
            }
            id={name}
            contentClassName={styles.alertConfigurationCard}
        >
            <Form
                onFinish={onSubmit}
                form={form}
                initialValues={{
                    threshold: alert.CountThreshold,
                    channels: alert.ChannelsToNotify.map(
                        (channel: any) => channel.webhook_channel_id
                    ),
                    excludedEnvironments: alert.ExcludedEnvironments,
                    lookbackPeriod: [lookbackPeriod],
                    userProperties: alert.UserProperties?.map(
                        (userProperty: any) =>
                            getPropertiesOption(userProperty).value
                    ),
                    trackProperties: alert.TrackProperties?.map(
                        (trackProperty: any) =>
                            getPropertiesOption(trackProperty).value
                    ),
                }}
            >
                {type === ALERT_TYPE.UserProperties && (
                    <section>
                        <h3>User Properties</h3>
                        <p>
                            Pick the user properties that you would like to get
                            alerted for.
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
                            Pick the track properties that you would like to get
                            alerted for.
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
                        Pick Slack channels or people to message when an alert
                        is created.
                    </p>
                    <Form.Item shouldUpdate>
                        {() => (
                            <Select
                                className={styles.channelSelect}
                                options={channels}
                                mode="multiple"
                                placeholder={`Select a channel(s) or person(s) to send ${name} to.`}
                                onChange={onChannelsChange}
                                notFoundContent={
                                    <div>Slack is not configured yet.</div>
                                }
                                defaultValue={alert.ChannelsToNotify.map(
                                    (channel: any) => channel.webhook_channel_id
                                )}
                                dropdownRender={(menu) => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div className={styles.addContainer}>
                                            Can't find the channel or person
                                            here?{' '}
                                            <a href={slackUrl}>
                                                Add a Slack Channel
                                            </a>
                                            .
                                        </div>
                                    </div>
                                )}
                            />
                        )}
                    </Form.Item>
                </section>

                <section>
                    <h3>Excluded Environments</h3>
                    <p>
                        Pick environments that should not create alerts. Some
                        teams don't want to be woken up at 2AM if an alert is
                        created from localhost. Environments can be set by
                        passing the environment name when you{' '}
                        <a
                            href="https://docs.highlight.run/reference#options"
                            target="_blank"
                            rel="noreferrer"
                        >
                            start Highlight in your app
                        </a>
                        .
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
                    <>
                        <section>
                            <h3>Threshold</h3>
                            <p>
                                {threshold <= 0 ? (
                                    `Setting the threshold to ${threshold} means no alerts will be created.`
                                ) : (
                                    <span>
                                        An alert will be created if{' '}
                                        <b>
                                            <TextTransition
                                                text={`${threshold}`}
                                                inline
                                            />{' '}
                                            {name.toLocaleLowerCase()}
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
                                )}
                            </p>
                            <div className={styles.frequencyContainer}>
                                <Form.Item name="threshold">
                                    <InputNumber
                                        onChange={onThresholdChange}
                                        min={0}
                                    />
                                </Form.Item>
                                <Form.Item name="lookbackPeriod">
                                    <Select
                                        className={styles.lookbackPeriodSelect}
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
                        <Button
                            trackingId="SaveAlertConfiguration"
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
