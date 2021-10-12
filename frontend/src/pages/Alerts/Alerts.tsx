import Alert from '@components/Alert/Alert';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Card from '@components/Card/Card';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Table from '@components/Table/Table';
import Tag from '@components/Tag/Tag';
import SvgBugIcon from '@icons/BugIcon';
import SvgChevronRightIcon from '@icons/ChevronRightIcon';
import SvgFaceIdIcon from '@icons/FaceIdIcon';
import SvgQuoteIcon from '@icons/QuoteIcon';
import SvgSparkles2Icon from '@icons/Sparkles2Icon';
import SvgTargetIcon from '@icons/TargetIcon';
import SvgUserPlusIcon from '@icons/UserPlusIcon';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import styles from './Alerts.module.scss';

export enum ALERT_TYPE {
    Error,
    FirstTimeUser,
    UserProperties,
    TrackProperties,
    SessionFeedbackComment,
    NewSession,
}

export enum ALERT_NAMES {
    ERROR_ALERT = 'Errors',
    NEW_USER_ALERT = 'New Users',
    USER_PROPERTIES_ALERT = 'User Properties',
    TRACK_PROPERTIES_ALERT = 'Track Events',
    SESSION_FEEDBACK_ALERT = 'Feedback',
    NEW_SESSION_ALERT = 'New Sessions',
}

export const ALERT_CONFIGURATIONS = {
    ERROR_ALERT: {
        name: ALERT_NAMES['ERROR_ALERT'],
        canControlThreshold: true,
        type: ALERT_TYPE.Error,
        description: 'Get alerted when an error is thrown in your app.',
        icon: <SvgBugIcon />,
    },
    NEW_USER_ALERT: {
        name: ALERT_NAMES['NEW_USER_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.FirstTimeUser,
        description:
            'Get alerted when a new user uses your app for the first time.',
        icon: <SvgUserPlusIcon />,
    },
    USER_PROPERTIES_ALERT: {
        name: ALERT_NAMES['USER_PROPERTIES_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.UserProperties,
        description:
            'Get alerted when users you want to track record a session.',
        icon: <SvgFaceIdIcon />,
    },
    TRACK_PROPERTIES_ALERT: {
        name: ALERT_NAMES['TRACK_PROPERTIES_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.TrackProperties,
        description: 'Get alerted when an action is done in your application.',
        icon: <SvgTargetIcon />,
    },
    SESSION_FEEDBACK_ALERT: {
        name: ALERT_NAMES['SESSION_FEEDBACK_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.SessionFeedbackComment,
        description: 'Get alerted when a user submits a session feedback.',
        icon: <SvgQuoteIcon />,
    },
    NEW_SESSION_ALERT: {
        name: ALERT_NAMES['NEW_SESSION_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.NewSession,
        description: 'Get alerted every time a session is created.',
        icon: <SvgSparkles2Icon />,
    },
} as const;

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

    const history = useHistory();
    const alertsAsTableRows = [
        ...(alertsPayload?.error_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['ERROR_ALERT'],
            type: ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
        })),
        ...(alertsPayload?.new_user_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
        })),
        ...(alertsPayload?.session_feedback_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'],
            type: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].name,
        })),
        ...(alertsPayload?.track_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
        })),
        ...(alertsPayload?.user_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
        })),
        ...(alertsPayload?.new_session_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
        })),
    ];

    return (
        <>
            <div className={styles.subTitleContainer}>
                <p>Manage your alerts for your project.</p>
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

            {alertsPayload?.is_integrated_with_slack && (
                <Card>
                    <Table
                        columns={TABLE_COLUMNS}
                        loading={loading}
                        dataSource={alertsAsTableRows}
                        pagination={false}
                        showHeader={false}
                        renderEmptyComponent={
                            <div className={styles.emptyContainer}>
                                <h3>
                                    Your project doesn't have any alerts yet.
                                </h3>
                                <p>
                                    Alerts help you and your team stay on top of
                                    things as they happen in your application.
                                    You can set up alerts for things like when
                                    certain actions happen, errors thrown, and
                                    when a new user uses your app.
                                </p>
                                <ButtonLink
                                    to="alerts/new"
                                    trackingId="NoAlertsCreateNewAlert"
                                >
                                    Create an Alert
                                </ButtonLink>
                            </div>
                        }
                        onRow={(record) => ({
                            onClick: () => {
                                history.push(`alerts/${record.id}`);
                            },
                        })}
                    />
                </Card>
            )}
        </>
    );
};

export default AlertsPage;
