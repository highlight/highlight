import Alert from '@components/Alert/Alert';
import BarChart from '@components/BarChart/BarChart';
import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import Card from '@components/Card/Card';
import PersonalNotificationButton from '@components/Header/components/PersonalNotificationButton/PersonalNotificationButton';
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState';
import Table from '@components/Table/Table';
import Tag from '@components/Tag/Tag';
import SvgBugIcon from '@icons/BugIcon';
import SvgChevronRightIcon from '@icons/ChevronRightIcon';
import SvgCursorClickIcon from '@icons/CursorClickIcon';
import SvgFaceIdIcon from '@icons/FaceIdIcon';
import SvgQuoteIcon from '@icons/QuoteIcon';
import SvgSparkles2Icon from '@icons/Sparkles2Icon';
import SvgTargetIcon from '@icons/TargetIcon';
import SvgUserPlusIcon from '@icons/UserPlusIcon';
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import AlertSetupModal from '@pages/Alerts/AlertSetupModal/AlertSetupModal';
import AlertLastEditedBy from '@pages/Alerts/components/AlertLastEditedBy/AlertLastEditedBy';
import { getAlertTypeColor } from '@pages/Alerts/utils/AlertsUtils';
import { useParams } from '@util/react-router/useParams';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import styles from './Alerts.module.scss';

export enum ALERT_TYPE {
    Error,
    FirstTimeUser,
    UserProperties,
    TrackProperties,
    SessionFeedbackComment,
    NewSession,
    RageClick,
}

export enum ALERT_NAMES {
    ERROR_ALERT = 'Errors',
    NEW_USER_ALERT = 'New Users',
    USER_PROPERTIES_ALERT = 'User Properties',
    TRACK_PROPERTIES_ALERT = 'Track Events',
    SESSION_FEEDBACK_ALERT = 'Feedback',
    NEW_SESSION_ALERT = 'New Sessions',
    RAGE_CLICK_ALERT = 'Rage Clicks',
}

export const ALERT_CONFIGURATIONS = {
    ERROR_ALERT: {
        name: ALERT_NAMES['ERROR_ALERT'],
        canControlThreshold: true,
        type: ALERT_TYPE.Error,
        description: 'Get alerted when an error is thrown in your app.',
        icon: <SvgBugIcon />,
        supportsExcludeRules: false,
    },
    RAGE_CLICK_ALERT: {
        name: ALERT_NAMES['RAGE_CLICK_ALERT'],
        canControlThreshold: true,
        type: ALERT_TYPE.RageClick,
        description: (
            <>
                {'Get alerted whenever a user'}{' '}
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a
                    href="https://docs.highlight.run/rage-clicks"
                    target="_blank"
                >
                    rage clicks.
                </a>
            </>
        ),
        icon: <SvgCursorClickIcon />,
        supportsExcludeRules: false,
    },
    NEW_USER_ALERT: {
        name: ALERT_NAMES['NEW_USER_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.FirstTimeUser,
        description:
            'Get alerted when a new user uses your app for the first time.',
        icon: <SvgUserPlusIcon />,
        supportsExcludeRules: false,
    },
    USER_PROPERTIES_ALERT: {
        name: ALERT_NAMES['USER_PROPERTIES_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.UserProperties,
        description:
            'Get alerted when users you want to track record a session.',
        icon: <SvgFaceIdIcon />,
        supportsExcludeRules: false,
    },
    TRACK_PROPERTIES_ALERT: {
        name: ALERT_NAMES['TRACK_PROPERTIES_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.TrackProperties,
        description: 'Get alerted when an action is done in your application.',
        icon: <SvgTargetIcon />,
        supportsExcludeRules: false,
    },
    SESSION_FEEDBACK_ALERT: {
        name: ALERT_NAMES['SESSION_FEEDBACK_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.SessionFeedbackComment,
        description: (
            <>
                Get alerted when a user submits{' '}
                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                <a
                    href="https://docs.highlight.run/user-feedback"
                    target="_blank"
                >
                    a session feedback
                </a>
                .
            </>
        ),
        icon: <SvgQuoteIcon />,
        supportsExcludeRules: false,
    },
    NEW_SESSION_ALERT: {
        name: ALERT_NAMES['NEW_SESSION_ALERT'],
        canControlThreshold: false,
        type: ALERT_TYPE.NewSession,
        description: 'Get alerted every time a session is created.',
        icon: <SvgSparkles2Icon />,
        supportsExcludeRules: true,
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
                            allAdmins={record.allAdmins}
                            loading={record.loading}
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
                    <Tag
                        backgroundColor={getAlertTypeColor(type)}
                        color="var(--color-white)"
                        infoTooltipText={record.configuration.description}
                    >
                        {type}
                    </Tag>
                </span>
            );
        },
    },
    {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (frequency: any, record: any) => {
            const hasData = record.DailyFrequency.some(
                (value: number) => value !== 0
            );
            return (
                <div className={styles.chart}>
                    <div className={styles.innerChart}>
                        {hasData ? (
                            <BarChart
                                sharedMaxNum={frequency}
                                height={30}
                                data={record.DailyFrequency}
                                showBase={false}
                            />
                        ) : (
                            <p className={styles.frequencyGraphEmptyMessage}>
                                No Recent Alerts
                            </p>
                        )}
                    </div>
                </div>
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
    const [maxNum, setMaxNum] = useState(5);
    useEffect(() => {
        if (!loading) {
            let tempMax = 5;
            alertsPayload?.error_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.new_user_alerts?.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.session_feedback_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.track_properties_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.user_properties_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.new_session_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            alertsPayload?.rage_click_alerts.forEach((val) => {
                if (!!val?.DailyFrequency) {
                    tempMax = Math.max(tempMax, ...val.DailyFrequency);
                }
            });
            setMaxNum(tempMax);
        }
    }, [alertsPayload, loading]);

    const alertsAsTableRows = [
        ...(alertsPayload?.error_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['ERROR_ALERT'],
            type: ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['ERROR_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.new_user_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['NEW_USER_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.session_feedback_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'],
            type: ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.track_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.user_properties_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
            type: ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
            Name:
                alert?.Name ||
                ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.new_session_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
            type: ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
        ...(alertsPayload?.rage_click_alerts || []).map((alert) => ({
            ...alert,
            configuration: ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'],
            type: ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'].name,
            Name: alert?.Name || ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'].name,
            key: alert?.id,
            frequency: maxNum,
            allAdmins: alertsPayload?.admins || [],
            loading,
        })),
    ];

    return (
        <>
            <AlertSetupModal />
            <div className={styles.subTitleContainer}>
                <p>Manage the alerts for your project.</p>
                {alertsPayload?.is_integrated_with_slack &&
                    alertsAsTableRows.length > 0 && (
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
                                    <p>
                                        Highlight needs to be connected with
                                        Slack in order to send you and your team
                                        messages.
                                    </p>
                                    <p>
                                        Once connected, you'll be able to get
                                        alerts for things like:
                                    </p>
                                    <ul>
                                        <li>Errors thrown</li>
                                        <li>New users</li>
                                        <li>A new feature is used</li>
                                        <li>User submitted feedback</li>
                                    </ul>
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
                    closable={false}
                    className={styles.integrationAlert}
                />
            ) : (
                <PersonalNotificationButton
                    text="Connect Highlight with Slack"
                    className={styles.hiddenSlackIntegrationButton}
                    type="Organization"
                />
            )}

            {((alertsPayload && alertsPayload?.is_integrated_with_slack) ||
                !alertsPayload) && (
                <Card noPadding>
                    <Table
                        columns={TABLE_COLUMNS}
                        loading={loading}
                        dataSource={alertsAsTableRows}
                        pagination={false}
                        showHeader={false}
                        rowHasPadding
                        renderEmptyComponent={
                            <SearchEmptyState
                                className={styles.emptyContainer}
                                item={'alerts'}
                                customTitle={`Your project doesn't have any alerts yet 😔`}
                                customDescription={
                                    <>
                                        <ButtonLink
                                            trackingId="NewAlert"
                                            className={styles.callToAction}
                                            to={`/${project_id}/alerts/new`}
                                        >
                                            New Alert
                                        </ButtonLink>
                                    </>
                                }
                            />
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
