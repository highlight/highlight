import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetBillingDetailsQuery } from '../../../graph/generated/hooks';
import Progress from '../../Progress/Progress';
import styles from './CurrentUsageCard.module.scss';

export const CurrentUsageCard = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    if (
        loading ||
        (data?.billingDetails.meter === undefined &&
            data?.billingDetails.plan.quota === undefined)
    ) {
        return null;
    }

    const {
        meter: currentUsage,
        plan: { quota: limit },
        sessionsOutOfQuota,
    } = data.billingDetails;

    return (
        <section className={styles.container}>
            <h3 className={styles.header}>
                <Link to={`/${organization_id}/billing`}>Upgrade </Link>to
                increase your limit!
            </h3>
            <p className={styles.description}>
                This workspace has used {currentUsage} of its {limit} monthly
                sessions limit ({((currentUsage / limit) * 100).toFixed(0)}%).
            </p>
            {sessionsOutOfQuota > -1 && (
                <p className={styles.description}>
                    There are <b>{sessionsOutOfQuota} sessions</b> that can be
                    viewed after you upgrade.
                </p>
            )}
            <Progress
                numerator={currentUsage}
                denominator={limit}
                showInfo={false}
            />
        </section>
    );
};
