import { PlanType, SubscriptionInterval } from '@graph/schemas';
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
}: {
    current: boolean;
    billingPlan: BillingPlan;
    onSelect: () => void;
    loading: boolean;
    subscriptionInterval: SubscriptionInterval;
    disabled?: boolean;
}) => {
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
                    )}${billingPlan.type === PlanType.Enterprise ? '+' : ''}`}
                </span>
                {billingPlan.type !== PlanType.Free && <span>/mo</span>}
            </div>
            <p className={styles.billingFrequency}>
                {billingPlan.type === PlanType.Free
                    ? 'no billing'
                    : subscriptionInterval === SubscriptionInterval.Annual
                    ? `$${formatNumberWithDelimiters(
                          billingPlan.annualPrice * 12
                      )}${
                          billingPlan.type === PlanType.Enterprise ? '+' : ''
                      } billed annually`
                    : 'billed monthly'}
            </p>
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
