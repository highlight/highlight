import { useGetProjectAdminsQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import moment from 'moment';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import styles from './AlertLastEditedBy.module.scss';

interface Props {
    adminId: string;
    lastEditedTimestamp: string;
}

const AlertLastEditedBy = ({ adminId, lastEditedTimestamp }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetProjectAdminsQuery({
        variables: { project_id },
    });

    const admin = data?.admins.find((admin) => admin?.id === adminId);
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
