import ButtonLink from '@components/Button/ButtonLink/ButtonLink';
import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import Switch from '@components/Switch/Switch';
import { AdminRole, PlanType, SubscriptionInterval } from '@graph/schemas';
import { MEMBERS_PRICE } from '@pages/Billing/BillingStatusCard/BillingStatusCard';
import { Authorization } from '@util/authorization/authorization';
import { formatNumberWithDelimiters } from '@util/numbers';
import classNames from 'classnames/bind';
import React, { useState } from 'react';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import SvgVerifyCheckIcon from '../../../static/VerifyCheckIcon';
import { BillingPlan } from './BillingConfig';
import styles from './BillingPlanCard.module.scss';

export const BillingPlanCard = ({
    billingPlan,
    onSelect,
    current,
    currentUnlimitedMembers,
    loading,
    subscriptionInterval,
    disabled,
    memberCount,
    glowing,
}: {
    current: boolean;
    currentUnlimitedMembers: boolean;
    billingPlan: BillingPlan;
    onSelect: (unlimitedMembers: boolean) => void;
    loading: boolean;
    subscriptionInterval: SubscriptionInterval;
    disabled?: boolean;
    memberCount: number;
    glowing?: boolean;
}) => {
    const [unlimitedMembers, setUnlimitedMembers] = useState<boolean>(
        currentUnlimitedMembers
    );
    const membersIncluded = unlimitedMembers
        ? undefined
        : billingPlan.membersIncluded;
    let membersOverage = 0;
    if (!!membersIncluded) {
        membersOverage = memberCount - membersIncluded;
    }
    const membersPrice = membersOverage * MEMBERS_PRICE;

    return (
        <div
            className={classNames(styles.billingPlanCard, {
                [styles.currentPlan]: current,
                [styles.glowingPlan]: glowing,
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
                            ? unlimitedMembers
                                ? billingPlan.annualUnlimitedMembersPrice
                                : billingPlan.annualPrice
                            : unlimitedMembers
                            ? billingPlan.monthlyUnlimitedMembersPrice
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
            <Authorization allowedRoles={[AdminRole.Admin]}>
                <Switch
                    loading={loading}
                    label={
                        <div className={styles.extraMembers}>
                            {billingPlan.type ===
                            PlanType.Free ? null : membersOverage > 0 ? (
                                <>
                                    <span className={styles.extraMembersCost}>
                                        + ${membersPrice}
                                    </span>
                                    <span
                                        className={styles.extraMembersBreakdown}
                                    >
                                        (${MEMBERS_PRICE} x {membersOverage}{' '}
                                        seat
                                        {membersOverage > 1 ? 's' : ''}) monthly
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className={styles.extraMembersCost}>
                                        {membersIncluded || 'Unlimited'}
                                    </span>
                                    <span
                                        className={styles.extraMembersBreakdown}
                                    >
                                        {' '}
                                        members included
                                        {membersIncluded === undefined
                                            ? '!'
                                            : ' for free'}
                                    </span>
                                </>
                            )}
                        </div>
                    }
                    size="small"
                    labelFirst
                    justifySpaceBetween
                    noMarginAroundSwitch
                    checked={unlimitedMembers}
                    onChange={(isUnlimited) => {
                        setUnlimitedMembers(isUnlimited);
                    }}
                    trackingId="UnlimitedMembers"
                />
            </Authorization>
            <ul className={styles.advertisedFeaturesWrapper}>
                {billingPlan.advertisedFeatures.map((feature) => (
                    <li
                        className={styles.advertisedFeature}
                        key={
                            typeof feature === 'string' ? feature : feature.text
                        }
                    >
                        <SvgVerifyCheckIcon
                            className={styles.featureCheckIcon}
                        />
                        {typeof feature === 'string' ? (
                            feature
                        ) : (
                            <span>
                                {feature.text}
                                <InfoTooltip
                                    title={feature.tooltip}
                                    size="medium"
                                />
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {billingPlan.type === PlanType.Enterprise ? (
                <ButtonLink
                    trackingId="ChangeBillingPlan"
                    disabled={disabled}
                    className={styles.button}
                    anchor
                    href="mailto:sales@highlight.run"
                    type="default"
                    fullWidth
                >
                    Contact Sales
                </ButtonLink>
            ) : (
                <Button
                    trackingId="ChangeBillingPlan"
                    disabled={
                        (current &&
                            currentUnlimitedMembers === unlimitedMembers) ||
                        disabled
                    }
                    onClick={() => onSelect(unlimitedMembers)}
                    className={styles.button}
                    loading={loading}
                >
                    {current && currentUnlimitedMembers === unlimitedMembers
                        ? 'Current plan'
                        : `Select ${billingPlan.name} Plan`}
                </Button>
            )}
        </div>
    );
};
