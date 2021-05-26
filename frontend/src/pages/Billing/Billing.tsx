import { loadStripe } from '@stripe/stripe-js';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useLocation, useParams } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import {
    useCreateOrUpdateSubscriptionMutation,
    useGetBillingDetailsQuery,
} from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';
import styles from './Billing.module.scss';
import { BILLING_PLANS } from './BillingPlanCard/BillingConfig';
import { BillingPlanCard } from './BillingPlanCard/BillingPlanCard';

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
    const [loading, setLoading] = useState<boolean>(false);

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

    const createOnSelect = (plan: PlanType) => {
        return async () => {
            setLoading(true);
            createOrUpdateSubscription({
                variables: {
                    organization_id: organization_id,
                    plan_type: plan,
                },
            }).then((r) => {
                if (!r.data?.createOrUpdateSubscription) {
                    message.success('Billing change applied!', 5);
                }
                refetch().then(() => {
                    setLoading(false);
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

    return (
        <LeadAlignLayout>
            <h2>Billing</h2>
            <p className={layoutStyles.subTitle}>
                Manage your billing information.
            </p>
            <div className={styles.billingPlanCardWrapper}>
                {BILLING_PLANS.map((billingPlan) =>
                    billingLoading || loading ? (
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
                        ></BillingPlanCard>
                    )
                )}
            </div>
        </LeadAlignLayout>
    );
};

export default BillingPage;
