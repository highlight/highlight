import Alert from '@components/Alert/Alert';
import Button from '@components/Button/Button/Button';
import Switch from '@components/Switch/Switch';
import SvgLogInIcon from '@icons/LogInIcon';
import { BillingStatusCard } from '@pages/Billing/BillingStatusCard/BillingStatusCard';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import { loadStripe } from '@stripe/stripe-js';
import {
    Authorization,
    useAuthorization,
} from '@util/authorization/authorization';
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import Skeleton from 'react-loading-skeleton';
import { useLocation } from 'react-router-dom';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import {
    useCreateOrUpdateStripeSubscriptionMutation,
    useGetBillingDetailsQuery,
    useGetCustomerPortalUrlLazyQuery,
    useGetSubscriptionDetailsQuery,
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
    const { checkPolicyAccess } = useAuthorization();
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

    const {
        loading: subscriptionLoading,
        data: subscriptionData,
        refetch: refetchSubscription,
    } = useGetSubscriptionDetailsQuery({
        variables: {
            workspace_id,
        },
    });

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

    const [isCancel, setIsCancel] = useState(false);

    useEffect(() => {
        const response = pathname.split('/')[4] ?? '';
        if (response === 'success') {
            updateBillingDetails({
                variables: { workspace_id },
            }).then(() => {
                message.success('Billing change applied!', 5);
                refetch();
                refetchSubscription();
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
        refetchSubscription,
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
                        refetchSubscription();
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
            {rainConfetti && <Confetti recycle={false} />}
            <div className={styles.titleContainer}>
                <div>
                    <h3>Billing</h3>
                    <p className={layoutStyles.subTitle}>
                        Upgrade or edit your workspace's billing settings.
                    </p>
                </div>
                <Authorization allowedRoles={[AdminRole.Admin]}>
                    <div className={styles.portalButtonContainer}>
                        <Button
                            trackingId="RedirectToCustomerPortal"
                            type="primary"
                            onClick={() => {
                                setIsCancel(false);
                                getCustomerPortalUrl({
                                    variables: { workspace_id },
                                });
                            }}
                            loading={loadingCustomerPortal && !isCancel}
                            className={styles.portalButton}
                        >
                            <SvgLogInIcon className={styles.portalButtonIcon} />{' '}
                            Payment Settings
                        </Button>
                        <Button
                            trackingId="CancelRedirectToCustomerPortal"
                            type="primary"
                            danger
                            onClick={() => {
                                setIsCancel(true);
                                getCustomerPortalUrl({
                                    variables: { workspace_id },
                                });
                            }}
                            loading={loadingCustomerPortal && isCancel}
                            className={styles.portalButton}
                        >
                            <SvgLogInIcon className={styles.portalButtonIcon} />{' '}
                            Cancel Subscription
                        </Button>
                    </div>
                </Authorization>
            </div>
            <BillingStatusCard
                planType={
                    billingData?.billingDetails.plan.type ?? PlanType.Free
                }
                sessionCount={billingData?.billingDetails.meter ?? 0}
                sessionLimit={billingData?.billingDetails.plan.quota ?? 0}
                memberCount={billingData?.billingDetails.membersMeter ?? 0}
                memberLimit={billingData?.billingDetails.plan.membersLimit ?? 0}
                subscriptionInterval={
                    billingData?.billingDetails.plan.interval ??
                    SubscriptionInterval.Monthly
                }
                billingPeriodEnd={billingData?.workspace?.billing_period_end}
                nextInvoiceDate={billingData?.workspace?.next_invoice_date}
                allowOverage={allowOverage}
                loading={billingLoading || subscriptionLoading}
                subscriptionDetails={subscriptionData?.subscription_details}
                trialEndDate={billingData?.workspace?.trial_end_date}
            />

            <Authorization allowedRoles={[AdminRole.Admin]}>
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
                        trackingId="BillingInterval"
                    />
                </div>
            </Authorization>
            <div className={styles.billingPlanCardWrapper}>
                <Authorization
                    allowedRoles={[AdminRole.Admin]}
                    forbiddenFallback={
                        <Alert
                            trackingId="AdminNoAccessToBilling"
                            type="info"
                            message="You don't have access to billing."
                            description={`You don't have permission to access the billing details for "${currentWorkspace?.name}". Please contact a workspace admin to make changes.`}
                        />
                    }
                >
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
                                disabled={
                                    !checkPolicyAccess({
                                        policyName: POLICY_NAMES.BillingUpdate,
                                    })
                                }
                                key={billingPlan.type}
                                current={
                                    billingData?.billingDetails.plan.type ===
                                        billingPlan.name &&
                                    (billingPlan.type === PlanType.Free ||
                                        billingData?.billingDetails.plan
                                            .interval === subscriptionInterval)
                                }
                                billingPlan={billingPlan}
                                onSelect={createOnSelect(billingPlan.type)}
                                loading={loadingPlanType === billingPlan.type}
                                subscriptionInterval={subscriptionInterval}
                                memberCount={
                                    billingData?.billingDetails.membersMeter
                                }
                            />
                        )
                    )}
                </Authorization>
            </div>
        </>
    );
};

export default BillingPage;
