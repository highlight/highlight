import { useAuthContext } from '@authentication/AuthContext';
import Alert from '@components/Alert/Alert';
import Button from '@components/Button/Button/Button';
import Switch from '@components/Switch/Switch';
import SvgLogInIcon from '@icons/LogInIcon';
import { BillingStatusCard } from '@pages/Billing/BillingStatusCard/BillingStatusCard';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { loadStripe } from '@stripe/stripe-js';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Helmet } from 'react-helmet';
import Skeleton from 'react-loading-skeleton';
import { useLocation } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import {
    useCreateOrUpdateStripeSubscriptionMutation,
    useGetBillingDetailsQuery,
    useGetCustomerPortalUrlLazyQuery,
    useUpdateBillingDetailsMutation,
} from '../../graph/generated/hooks';
import {
    AdminRole,
    PlanType,
    SubscriptionInterval,
} from '../../graph/generated/schemas';
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
    const { workspace_id } = useParams<{ workspace_id: string }>();
    const { pathname } = useLocation();
    const { currentWorkspace } = useApplicationContext();
    const [
        checkoutRedirectFailedMessage,
        setCheckoutRedirectFailedMessage,
    ] = useState<string>('');
    const [loadingPlanType, setLoadingPlanType] = useState<PlanType | null>(
        null
    );
    const [rainConfetti, setRainConfetti] = useState(false);
    const [subscriptionInterval, setSubscriptionInterval] = useState(
        SubscriptionInterval.Monthly
    );

    const {
        loading: billingLoading,
        error: billingError,
        data: billingData,
        refetch,
    } = useGetBillingDetailsQuery({
        variables: {
            workspace_id,
        },
        onCompleted: () => {
            if (billingData?.billingDetails?.plan?.interval !== undefined) {
                setSubscriptionInterval(
                    billingData.billingDetails.plan.interval
                );
            }
        },
    });

    const { admin, isHighlightAdmin } = useAuthContext();

    const [
        createOrUpdateStripeSubscription,
        { data },
    ] = useCreateOrUpdateStripeSubscriptionMutation();

    const [updateBillingDetails] = useUpdateBillingDetailsMutation();

    const [
        getCustomerPortalUrl,
        { loading: loadingCustomerPortal },
    ] = useGetCustomerPortalUrlLazyQuery({
        onCompleted: (data) => {
            if (data?.customer_portal_url) {
                window.open(data?.customer_portal_url, '_self');
            }
        },
    });

    useEffect(() => {
        const response = pathname.split('/')[4] ?? '';
        if (response === 'success') {
            updateBillingDetails({
                variables: { workspace_id },
            }).then(() => {
                message.success('Billing change applied!', 5);
                refetch();
            });
        }
        if (checkoutRedirectFailedMessage) {
            message.error(checkoutRedirectFailedMessage, 5);
        }
        if (billingError) {
            message.error(billingError.message, 5);
        }
    }, [
        pathname,
        checkoutRedirectFailedMessage,
        billingError,
        updateBillingDetails,
        workspace_id,
        refetch,
    ]);

    const createOnSelect = (newPlan: PlanType) => {
        return async () => {
            setLoadingPlanType(newPlan);
            createOrUpdateStripeSubscription({
                variables: {
                    workspace_id,
                    plan_type: newPlan,
                    interval: subscriptionInterval,
                },
            }).then((r) => {
                if (!r.data?.createOrUpdateStripeSubscription) {
                    updateBillingDetails({
                        variables: { workspace_id },
                    }).then(() => {
                        const previousPlan = billingData!.billingDetails!.plan
                            .type;
                        const upgradedPlan = didUpgradePlan(
                            previousPlan,
                            newPlan
                        );

                        if (upgradedPlan) {
                            setRainConfetti(true);
                            message.success(
                                'Thanks for upgrading your plan!',
                                10
                            );
                        } else {
                            setRainConfetti(false);
                            message.success('Billing change applied!', 5);
                        }
                        refetch().then(() => {
                            setLoadingPlanType(null);
                        });
                    });
                }
            });
        };
    };

    if (data?.createOrUpdateStripeSubscription && stripePromiseOrNull) {
        (async function () {
            const stripe = await stripePromiseOrNull;
            const result = stripe
                ? await stripe.redirectToCheckout({
                      sessionId: data.createOrUpdateStripeSubscription ?? '',
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

    const allowOverage = billingData?.workspace?.allow_meter_overage ?? true;

    return (
        <>
            <Helmet>
                <title>Workspace Billing</title>
            </Helmet>
            <LeadAlignLayout fullWidth>
                {rainConfetti && <Confetti recycle={false} />}
                <div className={styles.titleContainer}>
                    <div>
                        <h2>Billing</h2>
                        <p className={layoutStyles.subTitle}>
                            Manage your billing information.
                        </p>
                    </div>
                    {isHighlightAdmin && admin?.role === AdminRole.Admin && (
                        <Button
                            trackingId="RedirectToCustomerPortal"
                            type="primary"
                            onClick={() => {
                                getCustomerPortalUrl({
                                    variables: { workspace_id },
                                });
                            }}
                            loading={loadingCustomerPortal}
                            className={styles.portalButton}
                        >
                            <SvgLogInIcon /> Payment Settings
                        </Button>
                    )}
                </div>
                <BillingStatusCard
                    planType={
                        billingData?.billingDetails.plan.type ?? PlanType.Free
                    }
                    sessionCount={billingData?.billingDetails.meter ?? 0}
                    sessionLimit={billingData?.billingDetails.plan.quota ?? 0}
                    memberCount={billingData?.billingDetails.membersMeter ?? 0}
                    memberLimit={
                        billingData?.billingDetails.plan.membersLimit ?? 0
                    }
                    subscriptionInterval={
                        billingData?.billingDetails.plan.interval ??
                        SubscriptionInterval.Monthly
                    }
                    billingPeriodEnd={
                        billingData?.workspace?.billing_period_end
                    }
                    nextInvoiceDate={billingData?.workspace?.next_invoice_date}
                    allowOverage={allowOverage}
                    loading={billingLoading}
                    workspaceName={currentWorkspace?.name ?? ''}
                />
                <div className={styles.annualToggleBox}>
                    <Switch
                        loading={billingLoading}
                        label={
                            <span className={styles.annualToggleText}>
                                Annual Plan{' '}
                                <span className={styles.annualToggleAltText}>
                                    (20% off)
                                </span>
                            </span>
                        }
                        size="default"
                        labelFirst
                        justifySpaceBetween
                        noMarginAroundSwitch
                        checked={
                            subscriptionInterval === SubscriptionInterval.Annual
                        }
                        onChange={(isAnnual) => {
                            setSubscriptionInterval(
                                isAnnual
                                    ? SubscriptionInterval.Annual
                                    : SubscriptionInterval.Monthly
                            );
                        }}
                        trackingId="DOMInteractions"
                    />
                </div>
                <div className={styles.billingPlanCardWrapper}>
                    {admin?.role === AdminRole.Admin ? (
                        BILLING_PLANS.map((billingPlan) =>
                            billingLoading ? (
                                <Skeleton
                                    style={{ borderRadius: 8 }}
                                    count={1}
                                    height={325}
                                    width={275}
                                />
                            ) : (
                                <BillingPlanCard
                                    disabled={admin?.role !== AdminRole.Admin}
                                    key={billingPlan.type}
                                    current={
                                        billingData?.billingDetails.plan
                                            .type === billingPlan.name &&
                                        (billingPlan.type === PlanType.Free ||
                                            billingData?.billingDetails.plan
                                                .interval ===
                                                subscriptionInterval)
                                    }
                                    billingPlan={billingPlan}
                                    onSelect={createOnSelect(billingPlan.type)}
                                    loading={
                                        loadingPlanType === billingPlan.type
                                    }
                                    subscriptionInterval={subscriptionInterval}
                                />
                            )
                        )
                    ) : (
                        <Alert
                            trackingId="AdminNoAccessToBilling"
                            message="You don't have access to billing."
                            description={`You don't have permission to access the billing details for "${currentWorkspace?.name}". Please contact a workspace admin to make changes.`}
                        />
                    )}
                </div>
            </LeadAlignLayout>
        </>
    );
};

export default BillingPage;
