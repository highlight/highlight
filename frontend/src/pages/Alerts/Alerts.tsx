import Alert from '@components/Alert/Alert';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Table from '@components/Table/Table';
import Tag from '@components/Tag/Tag';
import { namedOperations } from '@graph/operations';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import {
    useCreateErrorAlertMutation,
    useCreateNewUserAlertMutation,
    useCreateSessionFeedbackAlertMutation,
    useCreateTrackPropertiesAlertMutation,
    useCreateUserPropertiesAlertMutation,
    useDeleteErrorAlertMutation,
    useDeleteSessionAlertMutation,
    useGetAlertsPagePayloadQuery,
} from '../../graph/generated/hooks';
import { AlertConfigurationCard } from './AlertConfigurationCard/AlertConfigurationCard';
import styles from './Alerts.module.scss';

export enum ALERT_TYPE {
    Error,
    FirstTimeUser,
    UserProperties,
    TrackProperties,
    SessionFeedbackComment,
}

const ALERT_CONFIGURATIONS = {
    errors: {
        name: 'Errors',
        canControlThreshold: true,
        type: ALERT_TYPE.Error,
    },
    'new users': {
        name: 'New Users',
        canControlThreshold: false,
        type: ALERT_TYPE.FirstTimeUser,
        description:
            'Get alerted when a new user starts their first journey in your application.',
    },
    'user properties': {
        name: 'User Properties',
        canControlThreshold: false,
        type: ALERT_TYPE.UserProperties,
        description:
            'Get alerted when users you want to track record a session.',
    },
    'track properties': {
        name: 'Track Events',
        canControlThreshold: false,
        type: ALERT_TYPE.TrackProperties,
        description: 'Get alerted when an action is done in your application.',
    },
    'session feedback comments': {
        name: 'Feedback',
        canControlThreshold: false,
        type: ALERT_TYPE.SessionFeedbackComment,
        description:
            'Get alerted when a user submits a session feedback comment.',
    },
};

const TABLE_COLUMNS = [
    {
        title: 'Name',
        dataIndex: 'Name',
        key: 'Name',
        ellipsis: true,
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 160,
        render: (type: string, record: any) => {
            return (
                <span className={styles.cellWithTooltip}>
                    <Tag backgroundColor={getAlertTypeColor(type)}>{type}</Tag>{' '}
                    <InfoTooltip title={record.configuration.description} />
                </span>
            );
        },
    },
    {
        title: 'Updated',
        dataIndex: 'updated_at',
        key: 'updated_at',
        render: (timestamp: string) => moment(timestamp).format('D MMM YYYY'),
        width: 120,
    },
    {
        title: 'Last Edited',
        dataIndex: 'LastAdminToEditID',
        key: 'LastAdminToEditID',
        render: (id: string) => <AlertLastEditedBy adminId={id} />,
        ellipsis: true,
    },
];

const AlertsPage = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetAlertsPagePayloadQuery({
        variables: { project_id },
    });

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
            name: 'New User Alert',
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
    const [deleteErrorAlert, {}] = useDeleteErrorAlertMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const [deleteSessionAlert, {}] = useDeleteSessionAlertMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
        update(cache, data) {
            const normalizedId = cache.identify({
                id: data.data?.deleteSessionAlert?.id,
                __typename: data.data?.__typename,
            });
            cache.evict({ id: normalizedId });
            cache.gc();
        },
    });
    const slackUrl = getSlackUrl('Organization', project_id, 'alerts');
    const alertsAsTableRows = [
        ...(data?.error_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['errors'],
            type: ALERT_CONFIGURATIONS['errors'].name,
        })),
        ...(data?.new_user_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['new users'],
            type: ALERT_CONFIGURATIONS['new users'].name,
        })),
        ...(data?.session_feedback_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['session feedback comments'],
            type: ALERT_CONFIGURATIONS['session feedback comments'].name,
        })),
        ...(data?.track_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['track properties'],
            type: ALERT_CONFIGURATIONS['track properties'].name,
        })),
        ...(data?.user_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['user properties'],
            type: ALERT_CONFIGURATIONS['user properties'].name,
        })),
    ];

    return (
        <LeadAlignLayout fullWidth>
            <h2>Alerts</h2>
            <button
                onClick={() => {
                    createErrorAlert();
                }}
            >
                Create Error
            </button>
            <button
                onClick={() => {
                    createSessionFeedbackAlert();
                }}
            >
                Create Session Feedback
            </button>
            <button
                onClick={() => {
                    createNewUserAlert();
                }}
            >
                Create New Users
            </button>
            <button
                onClick={() => {
                    createUserPropertiesAlert();
                }}
            >
                Create User Properties
            </button>
            <button
                onClick={() => {
                    createTrackPropertiesAlert();
                }}
            >
                Create Track Properties
            </button>
            <p className={layoutStyles.subTitle}>
                Configure the environments you want alerts for.
            </p>
            {!loading && !data?.is_integrated_with_slack ? (
                <Alert
                    trackingId="AlertPageSlackBotIntegration"
                    message={
                        !data?.is_integrated_with_slack
                            ? "Slack isn't connected"
                            : "Can't find a Slack channel or person?"
                    }
                    type={!data?.is_integrated_with_slack ? 'error' : 'info'}
                    description={
                        <>
                            {!data?.is_integrated_with_slack ? (
                                <>
                                    Highlight needs to be connected with Slack
                                    in order to send you and your team messages.
                                    <PersonalNotificationButton
                                        text="Connect Highlight with Slack"
                                        className={styles.integrationButton}
                                        type="Organization"
                                    />
                                </>
                            ) : (
                                <>
                                    Channels created and people joined after the
                                    last Highlight and Slack sync will not show
                                    up automatically.
                                    <PersonalNotificationButton
                                        text="Sync Highlight with Slack"
                                        className={styles.integrationButton}
                                        type="Organization"
                                    />
                                </>
                            )}
                        </>
                    }
                    className={styles.integrationAlert}
                />
            ) : (
                <PersonalNotificationButton
                    text="Connect Highlight with Slack"
                    className={styles.hiddenSlackIntegrationButton}
                    type="Organization"
                />
            )}

            <Table
                columns={TABLE_COLUMNS}
                loading={loading}
                dataSource={alertsAsTableRows}
                pagination={false}
            />
            <div className={styles.configurationContainer}>
                {loading ? (
                    Array(2)
                        .fill(0)
                        .map((_, index) => (
                            <Skeleton
                                key={index}
                                style={{
                                    width: '648px',
                                    height: 79,
                                    borderRadius: 8,
                                }}
                            />
                        ))
                ) : (
                    <>
                        {data?.error_alerts.map((errorAlert) => (
                            <AlertConfigurationCard
                                key={errorAlert?.id}
                                configuration={ALERT_CONFIGURATIONS['errors']}
                                alert={errorAlert || {}}
                                environmentOptions={
                                    data?.environment_suggestion || []
                                }
                                channelSuggestions={
                                    data?.slack_channel_suggestion || []
                                }
                                slackUrl={slackUrl}
                                onDeleteHandler={(alertId) => {
                                    deleteErrorAlert({
                                        variables: {
                                            error_alert_id: alertId,
                                            project_id,
                                        },
                                    });
                                }}
                            />
                        ))}
                        {data?.session_feedback_alerts.map(
                            (sessionFeedbackAlert) => (
                                <AlertConfigurationCard
                                    key={sessionFeedbackAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS[
                                            'session feedback comments'
                                        ]
                                    }
                                    alert={sessionFeedbackAlert || {}}
                                    environmentOptions={
                                        data?.environment_suggestion || []
                                    }
                                    channelSuggestions={
                                        data?.slack_channel_suggestion || []
                                    }
                                    slackUrl={slackUrl}
                                    onDeleteHandler={(alertId) => {
                                        deleteSessionAlert({
                                            variables: {
                                                session_alert_id: alertId,
                                                project_id,
                                            },
                                        });
                                    }}
                                />
                            )
                        )}
                        {data?.new_user_alerts?.map((newUserAlert) => (
                            <AlertConfigurationCard
                                key={newUserAlert?.id || ''}
                                configuration={
                                    ALERT_CONFIGURATIONS['new users']
                                }
                                alert={newUserAlert || {}}
                                environmentOptions={
                                    data?.environment_suggestion || []
                                }
                                channelSuggestions={
                                    data?.slack_channel_suggestion || []
                                }
                                slackUrl={slackUrl}
                                onDeleteHandler={(alertId) => {
                                    deleteSessionAlert({
                                        variables: {
                                            session_alert_id: alertId,
                                            project_id,
                                        },
                                    });
                                }}
                            />
                        ))}
                        {data?.user_properties_alerts.map(
                            (userPropertiesAlert) => (
                                <AlertConfigurationCard
                                    key={userPropertiesAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS['user properties']
                                    }
                                    alert={userPropertiesAlert || {}}
                                    environmentOptions={
                                        data?.environment_suggestion || []
                                    }
                                    channelSuggestions={
                                        data?.slack_channel_suggestion || []
                                    }
                                    slackUrl={slackUrl}
                                    onDeleteHandler={(alertId) => {
                                        deleteSessionAlert({
                                            variables: {
                                                session_alert_id: alertId,
                                                project_id,
                                            },
                                        });
                                    }}
                                />
                            )
                        )}
                        {data?.track_properties_alerts.map(
                            (trackPropertiesAlert) => (
                                <AlertConfigurationCard
                                    key={trackPropertiesAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS['track properties']
                                    }
                                    alert={trackPropertiesAlert || {}}
                                    environmentOptions={
                                        data?.environment_suggestion || []
                                    }
                                    channelSuggestions={
                                        data?.slack_channel_suggestion || []
                                    }
                                    slackUrl={slackUrl}
                                    onDeleteHandler={(alertId) => {
                                        deleteSessionAlert({
                                            variables: {
                                                session_alert_id: alertId,
                                                project_id,
                                            },
                                        });
                                    }}
                                />
                            )
                        )}
                    </>
                )}
            </div>
        </LeadAlignLayout>
    );
};

export default AlertsPage;
