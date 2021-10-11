import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext';
import moment from 'moment';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import styles from './AlertLastEditedBy.module.scss';

interface Props {
    adminId: string;
    lastEditedTimestamp: string;
}

const AlertLastEditedBy = ({ adminId, lastEditedTimestamp }: Props) => {
    const { alertsPayload, loading } = useAlertsContext();

    const admin = alertsPayload?.admins.find((admin) => admin?.id === adminId);
    const displayName = admin?.name || 'Highlight';

    return (
        <div className={styles.container}>
            {loading ? (
                <Skeleton />
            ) : (
                <>
                    <div className={styles.adminContainer}>
                        Updated by{' '}
                        <span className={styles.value}>{displayName}</span> •{' '}
                        {moment(lastEditedTimestamp).fromNow()}
                    </div>
                </>
            )}
        </div>
    );
};

export default AlertLastEditedBy;
