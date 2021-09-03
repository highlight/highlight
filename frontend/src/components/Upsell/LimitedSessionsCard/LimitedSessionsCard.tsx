import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import { useGetBillingDetailsQuery } from '../../../graph/generated/hooks';
import { isOrganizationWithinTrial } from '../../../util/billing/billing';
import ButtonLink from '../../Button/ButtonLink/ButtonLink';
import Card from '../../Card/Card';
import styles from './LimitedSessionsCard.module.scss';

const LimitedSessionCard = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const organizationIdRemapped =
        organization_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : organization_id;
    const { data } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    /** Show upsell when the current usage is 80% of the organization's plan. */
    const upsell =
        (data?.billingDetails.meter ?? 0) /
            (data?.billingDetails.plan.quota ?? 1) >=
        1.0;

    /** An organization is within a trial period by us setting an explicit trial end date on the organization. */
    const organizationWithinTrialPeriod = isOrganizationWithinTrial(
        data?.organization
    );

    if (!upsell || organizationWithinTrialPeriod) {
        return null;
    }

    return (
        <Card className={styles.container}>
            <h2>You've reached your session quota for this month 😔</h2>
            <p className={styles.description}>
                There are{' '}
                <b>{data?.billingDetails.sessionsOutOfQuota} sessions</b> that
                can be viewed after you upgrade. Sessions recorded before you
                reached your quota are still viewable.
            </p>
            <ButtonLink
                className={styles.center}
                to={`/${organizationIdRemapped}/billing`}
                trackingId="LimitedSessionsCardUpgradePlan"
            >
                Upgrade Plan
            </ButtonLink>
        </Card>
    );
};

export default LimitedSessionCard;
