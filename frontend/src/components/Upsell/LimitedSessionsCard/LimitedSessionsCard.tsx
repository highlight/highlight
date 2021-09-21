import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import { useGetBillingDetailsQuery } from '../../../graph/generated/hooks';
import { isProjectWithinTrial } from '../../../util/billing/billing';
import ButtonLink from '../../Button/ButtonLink/ButtonLink';
import Card from '../../Card/Card';
import styles from './LimitedSessionsCard.module.scss';

const LimitedSessionCard = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;
    const { data } = useGetBillingDetailsQuery({
        variables: { project_id },
    });

    /** Show upsell when the current usage is 80% of the project's plan. */
    const upsell =
        (data?.billingDetails.meter ?? 0) /
            (data?.billingDetails.plan.quota ?? 1) >=
        1.0;

    /** An project is within a trial period by us setting an explicit trial end date on the project. */
    const projectWithinTrialPeriod = isProjectWithinTrial(data?.organization);

    if (!upsell || projectWithinTrialPeriod) {
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
                to={`/${projectIdRemapped}/billing`}
                trackingId="LimitedSessionsCardUpgradePlan"
            >
                Upgrade Plan
            </ButtonLink>
        </Card>
    );
};

export default LimitedSessionCard;
