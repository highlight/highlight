import { useGetProjectAdminsQuery } from '@graph/hooks';
import SvgHighlightLogoSmall from '@icons/HighlightLogoSmall';
import { useParams } from '@util/react-router/useParams';
import React from 'react';
import Skeleton from 'react-loading-skeleton';

import styles from './AlertLastEditedBy.module.scss';

interface Props {
    adminId: string;
}

const AlertLastEditedBy = ({ adminId }: Props) => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data, loading } = useGetProjectAdminsQuery({
        variables: { project_id },
    });

    const admin = data?.admins.find((admin) => admin?.id === adminId);
    const image = admin?.photo_url;
    const displayName = admin?.name || 'Highlight';
    const displayEmail = admin?.email || 'Automatically created by Highlight';

    return (
        <div className={styles.container}>
            {loading ? (
                <Skeleton />
            ) : (
                <>
                    {image ? (
                        <img src={image} alt="" />
                    ) : (
                        <SvgHighlightLogoSmall />
                    )}
                    <div className={styles.adminContainer}>
                        <span className={styles.primary}>{displayName}</span>
                        <span className={styles.secondary}>{displayEmail}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default AlertLastEditedBy;
