import Alert from '@components/Alert/Alert';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import { getSlackUrl } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Table from '@components/Table/Table';
import Tag from '@components/Tag/Tag';
import { namedOperations } from '@graph/operations';
import SvgChevronRightIcon from '@icons/ChevronRightIcon';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Link, useHistory } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import {
    useCreateErrorAlertMutation,
    useCreateNewSessionAlertMutation,
    useCreateNewUserAlertMutation,
    useCreateSessionFeedbackAlertMutation,
    useCreateTrackPropertiesAlertMutation,
    useCreateUserPropertiesAlertMutation,
    useDeleteErrorAlertMutation,
    useDeleteSessionAlertMutation,
} from '../../graph/generated/hooks';
import { AlertConfigurationCard } from './AlertConfigurationCard/AlertConfigurationCard';
import styles from './Alerts.module.scss';

export enum ALERT_TYPE {
    Error,
    FirstTimeUser,
    UserProperties,
    TrackProperties,
    SessionFeedbackComment,
    NewSession,
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
    'new sessions': {
        name: 'New Sessions',
        canControlThreshold: false,
        type: ALERT_TYPE.NewSession,
        description: 'Get alerted every time a session is created.',
    },
};

const TABLE_COLUMNS = [
    {
        title: 'Name',
        dataIndex: 'Name',
        key: 'Name',
        render: (name: string, record: any) => {
            return (
                <div className={styles.nameCell}>
                    <div className={styles.primary}>{name}</div>
                    <div>
                        <AlertLastEditedBy
                            adminId={record.LastAdminToEditID}
                            lastEditedTimestamp={record.updated_at}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 160,
        render: (type: string, record: any) => {
            return (
                <span className={styles.cellWithTooltip}>
                    <Tag backgroundColor={getAlertTypeColor(type)}>
                        {type}
                        <InfoTooltip title={record.configuration.description} />
                    </Tag>
                </span>
            );
        },
    },
    {
        title: 'Configure',
        dataIndex: 'configure',
        key: 'configure',
        render: (_: any, record: any) => (
            <Link
                to={`alerts/${record.id}`}
                className={styles.configureButton}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                Configure <SvgChevronRightIcon />
            </Link>
        ),
    },
];

const AlertsPage = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { alertsPayload, loading } = useAlertsContext();

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
    const [deleteErrorAlert, {}] = useDeleteErrorAlertMutation({
        refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
    });
    const history = useHistory();
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
        ...(alertsPayload?.error_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['errors'],
            type: ALERT_CONFIGURATIONS['errors'].name,
        })),
        ...(alertsPayload?.new_user_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['new users'],
            type: ALERT_CONFIGURATIONS['new users'].name,
        })),
        ...(alertsPayload?.session_feedback_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['session feedback comments'],
            type: ALERT_CONFIGURATIONS['session feedback comments'].name,
        })),
        ...(alertsPayload?.track_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['track properties'],
            type: ALERT_CONFIGURATIONS['track properties'].name,
        })),
        ...(alertsPayload?.user_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['user properties'],
            type: ALERT_CONFIGURATIONS['user properties'].name,
        })),
        ...(alertsPayload?.new_session_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['new sessions'],
            type: ALERT_CONFIGURATIONS['new sessions'].name,
        })),
    ];

    return (
        <LeadAlignLayout>
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
            <button
                onClick={() => {
                    createNewSessionAlert();
                }}
            >
                Create New Session Alert
            </button>
            <div className={styles.subTitleContainer}>
                <p>Configure the environments you want alerts for.</p>
                <ButtonLink
                    trackingId="NewAlert"
                    className={styles.callToAction}
                    to={`/${project_id}/alerts/new`}
                >
                    New Alert
                </ButtonLink>
            </div>
            {!loading && !alertsPayload?.is_integrated_with_slack ? (
                <Alert
                    trackingId="AlertPageSlackBotIntegration"
                    message={
                        !alertsPayload?.is_integrated_with_slack
                            ? "Slack isn't connected"
                            : "Can't find a Slack channel or person?"
                    }
                    type={
                        !alertsPayload?.is_integrated_with_slack
                            ? 'error'
                            : 'info'
                    }
                    description={
                        <>
                            {!alertsPayload?.is_integrated_with_slack ? (
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
                showHeader={false}
                onRow={(record) => ({
                    onClick: (e) => {
                        console.log(e, record);
                        history.push(`alerts/${record.id}`);
                    },
                })}
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
                        {alertsPayload?.error_alerts.map((errorAlert) => (
                            <AlertConfigurationCard
                                key={errorAlert?.id}
                                configuration={ALERT_CONFIGURATIONS['errors']}
                                alert={errorAlert || {}}
                                environmentOptions={
                                    alertsPayload?.environment_suggestion || []
                                }
                                channelSuggestions={
                                    alertsPayload?.slack_channel_suggestion ||
                                    []
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
                        {alertsPayload?.session_feedback_alerts.map(
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
                                        alertsPayload?.environment_suggestion ||
                                        []
                                    }
                                    channelSuggestions={
                                        alertsPayload?.slack_channel_suggestion ||
                                        []
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
                        {alertsPayload?.new_user_alerts?.map((newUserAlert) => (
                            <AlertConfigurationCard
                                key={newUserAlert?.id || ''}
                                configuration={
                                    ALERT_CONFIGURATIONS['new users']
                                }
                                alert={newUserAlert || {}}
                                environmentOptions={
                                    alertsPayload?.environment_suggestion || []
                                }
                                channelSuggestions={
                                    alertsPayload?.slack_channel_suggestion ||
                                    []
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
                        {alertsPayload?.user_properties_alerts.map(
                            (userPropertiesAlert) => (
                                <AlertConfigurationCard
                                    key={userPropertiesAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS['user properties']
                                    }
                                    alert={userPropertiesAlert || {}}
                                    environmentOptions={
                                        alertsPayload?.environment_suggestion ||
                                        []
                                    }
                                    channelSuggestions={
                                        alertsPayload?.slack_channel_suggestion ||
                                        []
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
                        {alertsPayload?.new_session_alerts.map(
                            (trackPropertiesAlert) => (
                                <AlertConfigurationCard
                                    key={trackPropertiesAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS['new sessions']
                                    }
                                    alert={trackPropertiesAlert || {}}
                                    environmentOptions={
                                        alertsPayload?.environment_suggestion ||
                                        []
                                    }
                                    channelSuggestions={
                                        alertsPayload?.slack_channel_suggestion ||
                                        []
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
                        {alertsPayload?.track_properties_alerts.map(
                            (trackPropertiesAlert) => (
                                <AlertConfigurationCard
                                    key={trackPropertiesAlert?.id}
                                    configuration={
                                        ALERT_CONFIGURATIONS['track properties']
                                    }
                                    alert={trackPropertiesAlert || {}}
                                    environmentOptions={
                                        alertsPayload?.environment_suggestion ||
                                        []
                                    }
                                    channelSuggestions={
                                        alertsPayload?.slack_channel_suggestion ||
                                        []
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
