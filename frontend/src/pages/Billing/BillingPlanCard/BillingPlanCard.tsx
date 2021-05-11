import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './BillingPlanCard.module.scss';
import { BillingPlan } from './BillingConfig';
import classNames from 'classnames/bind';
import Button from '../../../components/Button/Button/Button';

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
            <h3 className={styles.billingPlanTitle}>{billingPlan.planName}</h3>
            <p
                className={classNames(
                    commonStyles.title,
                    styles.billingPlanPrice
                )}
            >{`$${billingPlan.monthlyPrice}`}</p>
            <p className={styles.billingFrequency}>billed monthly</p>
            <div className={styles.advertisedFeaturesWrapper}>
                {advertisedFeatureDivs}
            </div>

            <Button
                disabled={current}
                onClick={onSelect}
                className={styles.button}
            >
                {current
                    ? 'Current plan'
                    : `Select ${billingPlan.planName} Plan`}
            </Button>
        </div>
    );
};
