import React from 'react';
import commonStyles from '../../../Common.module.scss';
// import styles from './BillingPlan.module.scss';
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
    // needs stuff from config and function.
    // although could move function here. 
    // need to know if currently on that plan

    const advertisedFeatureDivs = billingPlan.advertisedFeatures.map(featureString => <div>{featureString}</div>)
    const isDisabled = false
    return (<div>
        <div >{billingPlan.planName}</div>
        <div className={commonStyles.title}>{`$${billingPlan.monthlyPrice}`}</div>
        <div>billed monthly</div>
        <div>
            {advertisedFeatureDivs}
        </div>

        <button
            type="submit"
            className={classNames(
                commonStyles.submitButton,
            )}
            disabled={isDisabled}
            onClick={onSelect}
        >
            {isDisabled ? 'Current plan' : `Select ${billingPlan.planName} Plan`}
        </button>

    </div>)
}