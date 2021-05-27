import { loadStripe } from '@stripe/stripe-js';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import Skeleton from 'react-loading-skeleton';
import { useLocation, useParams } from 'react-router-dom';

import Collapsible from '../../components/Collapsible/Collapsible';
import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import Progress from '../../components/Progress/Progress';
import {
    useCreateOrUpdateSubscriptionMutation,
    useGetBillingDetailsQuery,
} from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';
import SvgShieldWarningIcon from '../../static/ShieldWarningIcon';
import { formatNumberWithDelimiters } from '../../util/numbers';
import styles from './Billing.module.scss';
import { BILLING_PLANS } from './BillingPlanCard/BillingConfig';
import { BillingPlanCard } from './BillingPlanCard/BillingPlanCard';
import { didUpgradePlan } from './utils/utils';

const getStripePromiseOrNull = () => {
    const stripe_publishable_key = process.env.REACT_APP_STRIPE_API_PK;
    if (stripe_publishable_key) {
        return loadStripe(stripe_publishable_key);
    }
    return null;
};

const stripePromiseOrNull = getStripePromiseOrNull();

const BillingPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { pathname } = useLocation();
    const [
        checkoutRedirectFailedMessage,
        setCheckoutRedirectFailedMessage,
    ] = useState<string>('');
    const [loadingPlanType, setLoadingPlanType] = useState<PlanType | null>(
        null
    );
    const [rainConfetti, setRainConfetti] = useState(false);

    const {
        loading: billingLoading,
        error: billingError,
        data: billingData,
        refetch,
    } = useGetBillingDetailsQuery({
        variables: {
            organization_id: organization_id,
        },
    });

    const [
        createOrUpdateSubscription,
        { data },
    ] = useCreateOrUpdateSubscriptionMutation();

    useEffect(() => {
        const response = pathname.split('/')[3] ?? '';
        if (response === 'success') {
            message.success('Billing change applied!', 5);
        }
        if (checkoutRedirectFailedMessage) {
            message.error(checkoutRedirectFailedMessage, 5);
        }
        if (billingError) {
            message.error(billingError.message, 5);
        }
    }, [pathname, checkoutRedirectFailedMessage, billingError]);

    const createOnSelect = (newPlan: PlanType) => {
        return async () => {
            setLoadingPlanType(newPlan);
            createOrUpdateSubscription({
                variables: {
                    organization_id: organization_id,
                    plan_type: newPlan,
                },
            }).then((r) => {
                if (!r.data?.createOrUpdateSubscription) {
                    const previousPlan = billingData!.billingDetails!.plan.type;
                    const upgradedPlan = didUpgradePlan(previousPlan, newPlan);

                    if (upgradedPlan) {
                        setRainConfetti(true);
                        message.success(
                            "Thanks for upgrading your plan! As a token of our appreciation, we've made all your sessions viewable even if there's more than your new quota.",
                            10
                        );
                    } else {
                        setRainConfetti(false);
                        message.success('Billing change applied!', 5);
                    }
                }
                refetch().then(() => {
                    setLoadingPlanType(null);
                });
            });
        };
    };

    if (data?.createOrUpdateSubscription && stripePromiseOrNull) {
        (async function () {
            const stripe = await stripePromiseOrNull;
            const result = stripe
                ? await stripe.redirectToCheckout({
                      sessionId: data.createOrUpdateSubscription ?? '',
                  })
                : { error: 'Error: could not load stripe client.' };

            if (result.error) {
                // result.error is either a string message or a StripeError, which contains a message localized for the user.
                setCheckoutRedirectFailedMessage(
                    typeof result.error === 'string'
                        ? result.error
                        : typeof result.error.message === 'string'
                        ? result.error.message
                        : 'Redirect to checkout failed. This is most likely a network or browser error.'
                );
            }
        })();
    }

    /** Show upsell when the current usage is 80% of the organization's plan. */
    const upsell =
        (billingData?.billingDetails.meter ?? 0) /
            (billingData?.billingDetails.plan.quota ?? 1) >=
        0.8;

    return (
        <LeadAlignLayout fullWidth>
            {rainConfetti && <Confetti recycle={false} />}
            <h2>Billing</h2>
            <p className={layoutStyles.subTitle}>
                Manage your billing information.
            </p>
            <div className={styles.detailsCard}>
                <Collapsible
                    title={
                        <span className={styles.detailsCardTitle}>
                            <span>Plan Details</span>{' '}
                            {upsell && <SvgShieldWarningIcon />}
                        </span>
                    }
                    id="planDetails"
                >
                    <p>
                        This workspace is on the{' '}
                        <b>{billingData?.billingDetails.plan.type} Plan</b>{' '}
                        which has used{' '}
                        {formatNumberWithDelimiters(
                            billingData?.billingDetails.meter
                        )}{' '}
                        of its{' '}
                        {formatNumberWithDelimiters(
                            billingData?.billingDetails.plan.quota
                        )}{' '}
                        monthly sessions limit.
                    </p>
                    {upsell && (
                        <p>
                            <span>
                                You are nearing your monthly sessions limit.
                                Sessions recorded after you've reached your
                                limit will not be viewable until you upgrade
                                your plan.
                            </span>
                        </p>
                    )}
                    <Progress
                        numerator={billingData?.billingDetails.meter}
                        denominator={
                            billingData?.billingDetails.plan.quota || 1
                        }
                    />
                </Collapsible>
            </div>
            <div className={styles.billingPlanCardWrapper}>
                {BILLING_PLANS.map((billingPlan) =>
                    billingLoading ? (
                        <Skeleton
                            style={{ borderRadius: 8 }}
                            count={1}
                            height={325}
                            width={275}
                        />
                    ) : (
                        <BillingPlanCard
                            key={billingPlan.type}
                            current={
                                billingData?.billingDetails.plan.type ===
                                billingPlan.name
                            }
                            billingPlan={billingPlan}
                            onSelect={createOnSelect(billingPlan.type)}
                            loading={loadingPlanType === billingPlan.type}
                        />
                    )
                )}
            </div>
        </LeadAlignLayout>
    );
};

export default BillingPage;
