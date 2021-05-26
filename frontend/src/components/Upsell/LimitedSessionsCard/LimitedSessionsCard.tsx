import React from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetBillingDetailsQuery } from '../../../graph/generated/hooks';
import styles from './LimitedSessionsCard.module.scss';

const LimitedSessionCard = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { data } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    /** Show upsell when the current usage is 80% of the organization's plan. */
    const upsell =
        (data?.billingDetails.meter ?? 0) /
            (data?.billingDetails.plan.quota ?? 1) >=
        0.8;

    if (!upsell) {
        return null;
    }

    return (
        <section className={styles.container}>
            <div className={styles.actionsContainer}></div>
            <h3>
                Looks like you’ve reached your session quota for this month 😔
            </h3>
            <p className={styles.description}>
                You can still view sessions recorded before you reached your
                quota. There are{' '}
                <b>{data?.billingDetails.sessionsOutOfQuota} sessions</b> that
                can be viewed after you upgrade.
            </p>
            <Link to="billing" className={styles.link}>
                Upgrade plan
            </Link>
        </section>
    );
};

export default LimitedSessionCard;
