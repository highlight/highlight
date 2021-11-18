import Progress from '@components/Progress/Progress';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { PlanType, SubscriptionInterval } from '@graph/schemas';
import { BILLING_PLANS } from '@pages/Billing/BillingPlanCard/BillingConfig';
import { Divider } from 'antd';
import moment from 'moment';
import React from 'react';

import { formatNumberWithDelimiters } from '../../../util/numbers';
import styles from './BillingStatusCard.module.scss';

const SESSIONS_PRICE_PER_THOUSAND = 5;
const MEMBERS_PRICE = 20;

export const BillingStatusCard = ({
    planType,
    sessionCount,
    sessionLimit,
    memberCount,
    memberLimit,
    subscriptionInterval,
    allowOverage,
    loading,
    workspaceName,
    billingPeriodEnd,
    nextInvoiceDate,
}: {
    planType: PlanType;
    sessionCount: number;
    sessionLimit: number;
    memberCount: number;
    memberLimit: number;
    subscriptionInterval: SubscriptionInterval;
    allowOverage: boolean;
    loading: boolean;
    workspaceName: string;
    billingPeriodEnd: Date;
    nextInvoiceDate: Date;
}) => {
    let sessionsOverage = sessionCount - sessionLimit;
    if (!allowOverage || sessionsOverage < 0) {
        sessionsOverage = 0;
    }

    let membersOverage = memberCount - memberLimit;
    if (membersOverage < 0) {
        membersOverage = 0;
    }

    const matchedPlan = BILLING_PLANS.find((p) => p.name === planType);

    const baseSubtotal =
        subscriptionInterval === SubscriptionInterval.Annual
            ? matchedPlan?.annualPrice ?? 0
            : matchedPlan?.monthlyPrice ?? 0;
    const membersSubtotal = membersOverage * MEMBERS_PRICE;
    const overageSubtotal =
        Math.ceil(sessionsOverage / 1000) * SESSIONS_PRICE_PER_THOUSAND;

    const total =
        (nextInvoiceDate < billingPeriodEnd ? 0 : baseSubtotal) +
        membersSubtotal +
        overageSubtotal;

    const nextBillingDate =
        nextInvoiceDate < billingPeriodEnd ? nextInvoiceDate : billingPeriodEnd;

    return (
        <div className={styles.fieldsBox}>
            <h3 className={styles.cardTitle}>
                {workspaceName}'s Current Billing Status
            </h3>
            <div className={styles.cardSubtitleContainer}>
                <span>Current Base Plan</span>
                {loading ? (
                    <Skeleton width="45px" />
                ) : (
                    <span className={styles.subtotal}>
                        ${formatNumberWithDelimiters(baseSubtotal)}
                    </span>
                )}
            </div>
            <div className={styles.sectionContents}>
                {loading ? (
                    <Skeleton count={2} />
                ) : (
                    <>
                        <span className={styles.subText}>
                            You have used{' '}
                            <strong>
                                {formatNumberWithDelimiters(sessionCount)}
                            </strong>{' '}
                            of your{' '}
                            <strong>
                                {formatNumberWithDelimiters(sessionLimit)}
                            </strong>{' '}
                            sessions on the{' '}
                            <span className={styles.planText}>
                                {planType} Plan
                            </span>{' '}
                            (billed{' '}
                            {subscriptionInterval ===
                            SubscriptionInterval.Annual
                                ? 'yearly'
                                : 'monthly'}
                            ).
                        </span>
                        <div className={styles.progressContainer}>
                            <Progress
                                numerator={sessionCount}
                                denominator={sessionLimit || 1}
                                showInfo={false}
                            />
                        </div>
                    </>
                )}
            </div>
            {(loading || planType !== PlanType.Free) && (
                <>
                    <Divider />
                    <div className={styles.cardSubtitleContainer}>
                        <span>Member Count</span>
                        {loading ? (
                            <Skeleton width="45px" />
                        ) : (
                            <span className={styles.subtotal}>
                                ${formatNumberWithDelimiters(membersSubtotal)}
                            </span>
                        )}
                    </div>
                    <div className={styles.sectionContents}>
                        {loading ? (
                            <Skeleton />
                        ) : (
                            <span className={styles.subText}>
                                Your workspace has{' '}
                                <strong>
                                    {formatNumberWithDelimiters(memberCount)}
                                </strong>{' '}
                                members (
                                <strong>
                                    {formatNumberWithDelimiters(memberLimit)}
                                </strong>{' '}
                                are included for free with your plan).
                            </span>
                        )}
                    </div>
                    <Divider />
                    <div className={styles.cardSubtitleContainer}>
                        <span>Overage Status</span>
                        {loading ? (
                            <Skeleton width="45px" />
                        ) : (
                            <span className={styles.subtotal}>
                                ${formatNumberWithDelimiters(overageSubtotal)}
                            </span>
                        )}
                    </div>
                    <div className={styles.sectionContents}>
                        {loading ? (
                            <Skeleton />
                        ) : sessionsOverage > 0 ? (
                            <span className={styles.subText}>
                                You have a session overage of{' '}
                                <strong>
                                    {formatNumberWithDelimiters(
                                        sessionsOverage
                                    )}
                                </strong>{' '}
                                sessions ($5 per 1000 sessions).
                            </span>
                        ) : (
                            <span className={styles.subText}>
                                You're currently not paying session overage ($5
                                per 1000 sessions).
                            </span>
                        )}
                    </div>
                    <Divider />
                    <div className={styles.cardTotalContainer}>
                        {loading ? (
                            <>
                                <Skeleton width="120px" />
                                <Skeleton width="45px" />
                            </>
                        ) : (
                            <>
                                <span>
                                    Due{' '}
                                    {moment(nextBillingDate).format('M/D/YY')}:
                                </span>
                                <span className={styles.subtotal}>
                                    ${formatNumberWithDelimiters(total)}{' '}
                                </span>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
