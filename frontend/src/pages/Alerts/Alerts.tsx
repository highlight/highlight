import { useAuthContext } from '@authentication/AuthContext';
import Alert from '@components/Alert/Alert';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
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
import { Link, useHistory } from 'react-router-dom';

import {
    useCreateErrorAlertMutation,
    useCreateNewSessionAlertMutation,
    useCreateNewUserAlertMutation,
    useCreateSessionFeedbackAlertMutation,
    useCreateTrackPropertiesAlertMutation,
    useCreateUserPropertiesAlertMutation,
} from '../../graph/generated/hooks';
import styles from './Alerts.module.scss';

export enum ALERT_TYPE {
    Error,
    FirstTimeUser,
    UserProperties,
    TrackProperties,
    SessionFeedbackComment,
    NewSession,
}

export const ALERT_CONFIGURATIONS = {
    ERROR_ALERT: {
        name: 'Errors',
        canControlThreshold: true,
        type: ALERT_TYPE.Error,
        description: 'Get alerted when an error is thrown in your app.',
    },
    NEW_USER_ALERT: {
        name: 'New Users',
        canControlThreshold: false,
        type: ALERT_TYPE.FirstTimeUser,
        description:
            'Get alerted when a new user starts their first journey in your application.',
    },
    USER_PROPERTIES_ALERT: {
        name: 'User Properties',
        canControlThreshold: false,
        type: ALERT_TYPE.UserProperties,
        description:
            'Get alerted when users you want to track record a session.',
    },
    TRACK_PROPERTIES_ALERT: {
        name: 'Track Events',
        canControlThreshold: false,
        type: ALERT_TYPE.TrackProperties,
        description: 'Get alerted when an action is done in your application.',
    },
    SESSION_FEEDBACK_ALERT: {
        name: 'Feedback',
        canControlThreshold: false,
        type: ALERT_TYPE.SessionFeedbackComment,
        description:
            'Get alerted when a user submits a session feedback comment.',
    },
    NEW_SESSION_ALERT: {
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
    const { isHighlightAdmin } = useAuthContext();

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
    const history = useHistory();
    const alertsAsTableRows = [
        ...(alertsPayload?.error_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['ERROR_ALERT'],
            type: ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
        })),
        ...(alertsPayload?.new_user_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
        })),
        ...(alertsPayload?.session_feedback_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'],
            type: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].name,
        })),
        ...(alertsPayload?.track_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
        })),
        ...(alertsPayload?.user_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
        })),
        ...(alertsPayload?.new_session_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
        })),
    ];

    return (
        <>
            {isHighlightAdmin && (
                <>
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
                </>
            )}
            <div className={styles.subTitleContainer}>
                <p>Configure the environments you want alerts for.</p>
                {isHighlightAdmin && (
                    <ButtonLink
                        trackingId="NewAlert"
                        className={styles.callToAction}
                        to={`/${project_id}/alerts/new`}
                    >
                        New Alert
                    </ButtonLink>
                )}
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
                    onClick: () => {
                        history.push(`alerts/${record.id}`);
                    },
                })}
            />
        </>
    );
};

export default AlertsPage;
