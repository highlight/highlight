import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { BillingPlanCard } from './BillingPlanCard/BillingPlanCard';
import { BILLING_PLANS } from './BillingPlanCard/BillingConfig';

import styles from './Billing.module.scss';

import Skeleton from 'react-loading-skeleton';
import { message } from 'antd';
import {
    useCreateOrUpdateSubscriptionMutation,
    useGetBillingDetailsQuery,
} from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';

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
        <div className={styles.billingPageWrapper}>
            <div className={styles.billingPage}>
                <h2>Billing</h2>
                <p className={styles.subTitle}>
                    Manage your billing information.
                </p>
                <div className={styles.billingPlanCardWrapper}>
                    {billingLoading || loading ? (
                        <Skeleton
                            style={{ borderRadius: 8, marginRight: 20 }}
                            count={3}
                            height={300}
                            width={275}
                        />
                    ) : (
                        BILLING_PLANS.map((billingPlan) => (
                            <BillingPlanCard
                                key={billingPlan.type}
                                current={
                                    billingData?.billingDetails.plan.type ===
                                    billingPlan.name
                                }
                                billingPlan={billingPlan}
                                onSelect={createOnSelect(billingPlan.type)}
                            ></BillingPlanCard>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
