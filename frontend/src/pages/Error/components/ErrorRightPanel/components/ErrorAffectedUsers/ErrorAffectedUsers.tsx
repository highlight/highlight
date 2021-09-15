import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { Avatar } from '../../../../../../components/Avatar/Avatar';
import ButtonLink from '../../../../../../components/Button/ButtonLink/ButtonLink';
import Card from '../../../../../../components/Card/Card';
import RelativeTime from '../../../../../../components/RelativeTime/RelativeTime';
import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';
import SvgPlaySolidIcon from '../../../../../../static/PlaySolidIcon';
import { ErrorStateSelect } from '../../../../ErrorStateSelect/ErrorStateSelect';
import styles from './ErrorAffectedUsers.module.scss';

interface Props {
    errorGroup?: GetErrorGroupQuery;
    loading: boolean;
}

const ErrorAffectedUsers = ({ loading, errorGroup }: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const organizationIdRemapped =
        organization_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : organization_id;
    let numberOfAffectedSessions;
    let mostRecentAffectedSession;
    let numberOfAffectedUsers;

    if (errorGroup?.error_group && errorGroup.error_group.metadata_log.length) {
        numberOfAffectedSessions = errorGroup.error_group.metadata_log.length;
        mostRecentAffectedSession;

        const mostRecentAffectedSessionIndex = errorGroup.error_group.metadata_log.reduce(
            (acc, curr, index) => {
                if (
                    errorGroup?.error_group?.metadata_log?.length &&
                    errorGroup.error_group?.metadata_log[acc] &&
                    curr?.timestamp >
                        errorGroup.error_group.metadata_log[acc]?.timestamp
                ) {
                    return index;
                }
                return acc;
            },
            0
        );

        mostRecentAffectedSession =
            errorGroup.error_group.metadata_log[mostRecentAffectedSessionIndex];

        const uniqueUsers = new Set(
            errorGroup.error_group.metadata_log.map(
                (session) => session?.identifier || session?.fingerprint
            )
        );
        numberOfAffectedUsers = new Array(uniqueUsers).length;
    }

    return (
        <Card className={styles.card}>
            {loading || !errorGroup ? (
                <Skeleton style={{ height: 193 }} />
            ) : (
                <>
                    <div className={styles.metadata}>
                        <div className={styles.avatarContainer}>
                            {errorGroup?.error_group?.metadata_log
                                ?.slice(0, 3)
                                .map((session, index) => (
                                    <Avatar
                                        key={index}
                                        style={{ left: `${index * 15}px` }}
                                        seed={
                                            session?.identifier ||
                                            session?.fingerprint ||
                                            ''
                                        }
                                        shape="rounded"
                                        className={styles.avatar}
                                    />
                                ))}
                        </div>
                        <div className={styles.textContainer}>
                            <h3>{numberOfAffectedUsers} Affected Users</h3>
                            <p>{numberOfAffectedSessions} Total Sessions</p>
                            <p>
                                Recency:{' '}
                                {RelativeTime({
                                    datetime:
                                        mostRecentAffectedSession?.timestamp,
                                })}
                            </p>
                        </div>
                    </div>

                    <div className={styles.actionsContainer}>
                        <ButtonLink
                            trackingId="ErrorMostRecentSession"
                            to={`/${organizationIdRemapped}/sessions/${mostRecentAffectedSession?.session_id}`}
                            icon={
                                <SvgPlaySolidIcon
                                    className={styles.playButton}
                                />
                            }
                            fullWidth
                            className={styles.button}
                        >
                            Most Recent Session
                        </ButtonLink>
                        <ErrorStateSelect
                            state={errorGroup?.error_group?.state}
                            loading={loading}
                        />
                    </div>
                </>
            )}
        </Card>
    );
};

export default ErrorAffectedUsers;
