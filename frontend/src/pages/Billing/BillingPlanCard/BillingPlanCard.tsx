import Switch from '@components/Switch/Switch';
import { PlanType, SubscriptionInterval } from '@graph/schemas';
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
    onToggleInterval,
    disabled,
}: {
    current: boolean;
    billingPlan: BillingPlan;
    onSelect: () => void;
    loading: boolean;
    subscriptionInterval: SubscriptionInterval;
    onToggleInterval?: (val: boolean) => void;
    disabled?: boolean;
}) => {
    return (
        <div
            className={classNames(styles.billingPlanCard, {
                [styles.currentPlan]: current,
            })}
        >
            <h3 className={styles.billingPlanTitle}>{billingPlan.name}</h3>
            <h4
                className={classNames(
                    commonStyles.title,
                    styles.billingPlanPrice
                )}
            >{`$${
                subscriptionInterval === SubscriptionInterval.Annual
                    ? billingPlan.annualPrice
                    : billingPlan.monthlyPrice
            }`}</h4>
            <p className={styles.billingFrequency}>
                {billingPlan.type === PlanType.Free
                    ? 'no billing'
                    : subscriptionInterval === SubscriptionInterval.Annual
                    ? 'billed yearly'
                    : 'billed monthly'}
            </p>
            {onToggleInterval !== undefined && (
                <div className={styles.intervalToggleContainer}>
                    <Switch
                        label="Yearly"
                        alternateSideLabel="Monthly"
                        checked={
                            subscriptionInterval === SubscriptionInterval.Annual
                        }
                        onChange={onToggleInterval}
                        trackingId="ToggleSubscriptionInterval"
                        className={styles.intervalToggle}
                    />
                </div>
            )}
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
