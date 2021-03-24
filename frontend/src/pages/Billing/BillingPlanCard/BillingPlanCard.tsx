import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './BillingPlanCard.module.scss';
import { BillingPlan } from './BillingConfig';
import classNames from 'classnames/bind';

export const BillingPlanCard = ({
    billingPlan,
    onSelect,
    current,
}: {
    current: boolean;
    billingPlan: BillingPlan;
    onSelect: () => void;
}) => {
    const advertisedFeatureDivs = billingPlan.advertisedFeatures.map(
        (featureString) => (
            <div className={styles.advertisedFeature} key={featureString}>
                {featureString}
            </div>
        )
    );
    return (
        <div className={styles.billingPlanCard}>
            <div className={styles.billingPlanTitle}>
                {billingPlan.planName}
            </div>
            <div
                className={classNames(
                    commonStyles.title,
                    styles.billingPlanPrice
                )}
            >{`$${billingPlan.monthlyPrice}`}</div>
            <div className={styles.billingFrequency}>billed monthly</div>
            <div className={styles.advertisedFeaturesWrapper}>
                {advertisedFeatureDivs}
            </div>

            <button
                type="submit"
                className={
                    current
                        ? commonStyles.submitButton
                        : commonStyles.secondaryButton
                }
                disabled={current}
                onClick={onSelect}
            >
                {current
                    ? 'Current plan'
                    : `Select ${billingPlan.planName} Plan`}
            </button>
        </div>
    );
};
