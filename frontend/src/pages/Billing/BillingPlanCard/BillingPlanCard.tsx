import React from 'react';
import commonStyles from '../../../Common.module.scss';
import styles from './BillingPlanCard.module.scss';
import { BillingPlan } from './BillingConfig';
import classNames from 'classnames/bind';
import Button from '../../../components/Button/Button/Button';
import SvgVerifyCheckIcon from '../../../static/VerifyCheckIcon';

export const BillingPlanCard = ({
    billingPlan,
    onSelect,
    current,
}: {
    current: boolean;
    billingPlan: BillingPlan;
    onSelect: () => void;
}) => {
    return (
        <div className={styles.billingPlanCard}>
            <div className={styles.billingPlanTitle}>{billingPlan.name}</div>
            <div
                className={classNames(
                    commonStyles.title,
                    styles.billingPlanPrice
                )}
            >{`$${billingPlan.monthlyPrice}`}</div>
            <div className={styles.billingFrequency}>billed monthly</div>
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
                disabled={current}
                onClick={onSelect}
                className={styles.button}
            >
                {current ? 'Current plan' : `Select ${billingPlan.name} Plan`}
            </Button>
        </div>
    );
};
