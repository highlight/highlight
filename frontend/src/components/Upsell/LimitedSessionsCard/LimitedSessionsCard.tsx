import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetBillingDetailsQuery } from '../../../graph/generated/hooks';
import ButtonLink from '../../Button/ButtonLink/ButtonLink';
import Card from '../../Card/Card';
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
        <Card className={styles.container}>
            <h2>You’ve reached your session quota for this month 😔</h2>
            <p className={styles.description}>
                You can still view sessions recorded before you reached your
                quota. There are{' '}
                <b>{data?.billingDetails.sessionsOutOfQuota} sessions</b> that
                can be viewed after you upgrade.
            </p>
            <ButtonLink
                className={styles.center}
                to={`/${organization_id}/billing`}
                trackingId="LimitedSessionsCardUpgradePlan"
            >
                Upgrade Plan
            </ButtonLink>
        </Card>
    );
};

export default LimitedSessionCard;
