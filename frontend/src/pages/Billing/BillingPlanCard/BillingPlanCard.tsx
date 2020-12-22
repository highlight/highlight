import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './BillingPlanCard.module.scss';
import { BillingPlan } from './BillingConfig'
import classNames from 'classnames/bind';

type Inputs = {
    text: string;
};

export const BillingPlanCard = ({
    billingPlan,
    onSelect
}: {
    billingPlan: BillingPlan,
    onSelect: () => void
}) => {
    const advertisedFeatureDivs = billingPlan.advertisedFeatures.map(featureString => <div className={styles.advertisedFeature}>{featureString}</div>)
    // TODO: read this value from server
    const isDisabled = false
    return (<div className={styles.billingPlanCard}>
        <div className={styles.billingPlanTitle}>{billingPlan.planName}</div>
        <div className={classNames(commonStyles.title, styles.billingPlanPrice)}>{`$${billingPlan.monthlyPrice}`}</div>
        <div className={styles.billingFrequency}>billed monthly</div>
        <div className={styles.advertisedFeaturesWrapper}>
            {advertisedFeatureDivs}
        </div>

        <button
            type="submit"
            className={classNames(
                commonStyles.tertiaryButton,
            )}
            disabled={isDisabled}
            onClick={onSelect}
        >
            {isDisabled ? 'Current plan' : `Select ${billingPlan.planName} Plan`}
        </button>

    </div >)
}