import { PlanType, SubscriptionInterval } from '@graph/schemas';
import { MEMBERS_PRICE } from '@pages/Billing/BillingStatusCard/BillingStatusCard';
import { formatNumberWithDelimiters } from '@util/numbers';
import classNames from 'classnames/bind';
import React from 'react';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import SvgVerifyCheckIcon from '../../../static/VerifyCheckIcon';
import { BillingPlan } from './BillingConfig';
import styles from './BillingPlanCard.module.scss';

export const BillingPlanCard = ({
    billingPlan,
    onSelect,
    current,
    loading,
    subscriptionInterval,
    disabled,
    memberCount,
}: {
    current: boolean;
    billingPlan: BillingPlan;
    onSelect: () => void;
    loading: boolean;
    subscriptionInterval: SubscriptionInterval;
    disabled?: boolean;
    memberCount: number;
}) => {
    let membersOverage = 0;
    if (!!billingPlan.membersIncluded) {
        membersOverage = memberCount - billingPlan.membersIncluded;
    }
    const membersPrice = membersOverage * MEMBERS_PRICE;

    return (
        <div
            className={classNames(styles.billingPlanCard, {
                [styles.currentPlan]: current,
            })}
        >
            <h3 className={styles.billingPlanTitle}>{billingPlan.name}</h3>
            <div>
                <span
                    className={classNames(
                        commonStyles.title,
                        styles.billingPlanPrice
                    )}
                >
                    {`$${formatNumberWithDelimiters(
                        subscriptionInterval === SubscriptionInterval.Annual
                            ? billingPlan.annualPrice
                            : billingPlan.monthlyPrice
                    )}`}
                </span>
                {billingPlan.type !== PlanType.Free && (
                    <span>
                        /mo, billed{' '}
                        {subscriptionInterval === SubscriptionInterval.Annual
                            ? 'annually'
                            : 'monthly'}
                    </span>
                )}
            </div>
            <div className={styles.extraMembers}>
                {billingPlan.type === PlanType.Free ? null : membersOverage >
                  0 ? (
                    <>
                        <span className={styles.extraMembersCost}>
                            + ${membersPrice}
                        </span>
                        <span className={styles.extraMembersBreakdown}>
                            (${MEMBERS_PRICE} x {membersOverage} seat
                            {membersOverage > 1 ? 's' : ''}) billed monthly
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.extraMembersCost}>
                            {billingPlan.membersIncluded}
                        </span>
                        <span className={styles.extraMembersBreakdown}>
                            {' '}
                            members included for free
                        </span>
                    </>
                )}
            </div>
            <ul className={styles.advertisedFeaturesWrapper}>
                {billingPlan.advertisedFeatures.map((featureString) => (
                    <li
                        className={styles.advertisedFeature}
                        key={featureString}
                    >
                        <SvgVerifyCheckIcon />
                        {featureString}
                    </li>
                ))}
            </ul>
            <Button
                trackingId="ChangeBillingPlan"
                disabled={current || disabled}
                onClick={onSelect}
                className={styles.button}
                loading={loading}
            >
                {current ? 'Current plan' : `Select ${billingPlan.name} Plan`}
            </Button>
        </div>
    );
};
