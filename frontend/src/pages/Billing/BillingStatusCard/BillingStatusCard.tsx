import { useAuthContext } from '@authentication/AuthContext';
import Progress from '@components/Progress/Progress';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { USD } from '@dinero.js/currencies';
import {
    PlanType,
    SubscriptionDetails,
    SubscriptionInterval,
} from '@graph/schemas';
import { BILLING_PLANS } from '@pages/Billing/BillingPlanCard/BillingConfig';
import { Divider } from 'antd';
import {
    add,
    dinero,
    down,
    isZero,
    lessThan,
    multiply,
    subtract,
    toUnit,
} from 'dinero.js';
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
    billingPeriodEnd,
    nextInvoiceDate,
    subscriptionDetails: subscription_details,
}: {
    planType: PlanType;
    sessionCount: number;
    sessionLimit: number;
    memberCount: number;
    memberLimit: number;
    subscriptionInterval: SubscriptionInterval;
    allowOverage: boolean;
    loading: boolean;
    billingPeriodEnd: Date;
    nextInvoiceDate: Date;
    subscriptionDetails: SubscriptionDetails | undefined;
}) => {
    const { isHighlightAdmin } = useAuthContext();

    const baseAmount = dinero({
        amount: subscription_details?.baseAmount ?? 0,
        currency: USD,
    });

    const discountAmount = dinero({
        amount: subscription_details?.discountAmount ?? 0,
        currency: USD,
    });
    const discountPercent = subscription_details?.discountPercent;
    const hasDiscount = !isZero(discountAmount) || !!discountPercent;

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
        baseAmount ??
        dinero({
            amount:
                subscriptionInterval === SubscriptionInterval.Annual
                    ? (matchedPlan?.annualPrice ?? 0) * 12 * 100
                    : (matchedPlan?.monthlyPrice ?? 0) * 100,
            currency: USD,
        });
    const membersSubtotal = dinero({
        amount: membersOverage * MEMBERS_PRICE * 100,
        currency: USD,
    });
    const overageSubtotal = dinero({
        amount:
            Math.ceil(sessionsOverage / 1000) *
            SESSIONS_PRICE_PER_THOUSAND *
            100,
        currency: USD,
    });

    let total = add(membersSubtotal, overageSubtotal);
    if (!(nextInvoiceDate < billingPeriodEnd)) {
        total = add(total, baseSubtotal);
    }

    if (!isZero(discountAmount)) {
        total = subtract(total, discountAmount);
        const zero = dinero({ amount: 0, currency: USD });
        if (lessThan(total, zero)) {
            total = zero;
        }
    }

    if (!!discountPercent) {
        total = multiply(total, { amount: 100 - discountPercent, scale: 2 });
    }

    const nextBillingDate =
        nextInvoiceDate < billingPeriodEnd ? nextInvoiceDate : billingPeriodEnd;

    return (
        <div className={styles.fieldsBox}>
            <h3 className={styles.cardTitle}>Current Billing Status</h3>
            <div className={styles.cardSubtitleContainer}>
                <span>Current Base Plan</span>
                {loading ? (
                    <Skeleton width="45px" />
                ) : (
                    <span className={styles.subtotal}>
                        ${toUnit(baseSubtotal, { digits: 2, round: down })}
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
                                ? 'annually'
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
            {(loading || planType !== PlanType.Free) && isHighlightAdmin && (
                <>
                    <Divider />
                    <div className={styles.cardSubtitleContainer}>
                        <span>Member Count</span>
                        {loading ? (
                            <Skeleton width="45px" />
                        ) : (
                            <span className={styles.subtotal}>
                                $
                                {toUnit(membersSubtotal, {
                                    digits: 2,
                                    round: down,
                                })}
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
                                are included with your plan).
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
                                $
                                {toUnit(overageSubtotal, {
                                    digits: 2,
                                    round: down,
                                })}
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
                    <div className={styles.cardTotalRow}>
                        {loading ? (
                            <Skeleton width="120px" />
                        ) : hasDiscount ? (
                            discountPercent !== 0 ? (
                                <span>Discount: {discountPercent}% off</span>
                            ) : (
                                <span>
                                    Discount: $
                                    {toUnit(discountAmount, {
                                        digits: 2,
                                        round: down,
                                    })}{' '}
                                    off
                                </span>
                            )
                        ) : null}
                        <span className={styles.cardTotalContainer}>
                            {loading ? (
                                <>
                                    <Skeleton width="120px" />
                                    <Skeleton width="45px" />
                                </>
                            ) : (
                                <>
                                    {nextBillingDate && (
                                        <span>
                                            Due{' '}
                                            {moment(nextBillingDate).format(
                                                'M/D/YY'
                                            )}
                                            :
                                        </span>
                                    )}
                                    <span className={styles.subtotal}>
                                        $
                                        {toUnit(total, {
                                            digits: 2,
                                            round: down,
                                        })}{' '}
                                    </span>
                                </>
                            )}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};
