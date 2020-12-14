import React, { useEffect, useContext, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import { useMutation, gql } from '@apollo/client';
import classNames from 'classnames/bind';
import { loadStripe } from '@stripe/stripe-js';

import commonStyles from '../../Common.module.css';
import styles from './Billing.module.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

enum BillingViewType {
    Plans = "Plans", Invoices = "Invoices"
}

const getBillingResponseOrNull = (pathname: string, checkoutRedirectFailedMessage: string) => {
    const response = pathname.split('/')[3] ?? ''
    if (response === "success") {
        return <p className={styles.subTitle}>Thank you for your purchase. Checkout completed successfully.</p>
    } else if (checkoutRedirectFailedMessage) {
        return <p className={styles.subTitle}>{checkoutRedirectFailedMessage}</p>
    }

    return null

}

const getStripePromiseOrNull = () => {
    const stripe_publishable_key = process.env.REACT_APP_STRIPE_API_PK
    if (stripe_publishable_key) {
        return loadStripe(stripe_publishable_key);
    }
    return null
}

const stripePromiseOrNull = getStripePromiseOrNull()


export const Billing = () => {
    const { organization_id } = useParams();

    const [billingView, setBillingView] = useState((BillingViewType.Plans))
    const { pathname } = useLocation();
    const [checkoutRedirectFailedMessage, setCheckoutRedirectFailedMessage] = useState<string>("")

    const { setOpenSidebar } = useContext(SidebarContext);

    const [createCheckout, { data }] = useMutation<
        { createCheckout: string },
        { organization_id: number; price_id: string }
    >(
        gql`
            mutation CreateCheckout($organization_id: ID!, $price_id: String!) {
                createCheckout(
                    organization_id: $organization_id 
                    price_id: $price_id
                ) 
            }
        `
    );

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

    const onSubmit = async () => {
        // TODO: create config for the price plans
        createCheckout({ variables: { organization_id: organization_id, price_id: "price_1HswN7Gz4ry65q421RTixaZB" } })
    }

    if (data?.createCheckout && stripePromiseOrNull) {

        (async function () {
            const stripe = await stripePromiseOrNull;
            const result = stripe ? await stripe.redirectToCheckout({
                sessionId: data.createCheckout,
            }) : { error: "Error: could not load stripe client." };

            if (result.error) {
                // result.error is either a string message or a StripeError, which contains a message localized for the user.
                setCheckoutRedirectFailedMessage(typeof result.error === "string" ? result.error : typeof result.error.message ===
                    "string" ? result.error.message : "Redirect to checkout failed. This is most likely a network or browser error.")
            }
        })()
    }


    return (
        <div className={styles.billingPageWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.billingPage}>
                {getBillingResponseOrNull(pathname, checkoutRedirectFailedMessage)}
                <div className={styles.title}>Billing</div>
                <div className={styles.subTitle}>
                    Manage your billing information.
                </div>
                <RadioGroup<BillingViewType>
                    labels={[BillingViewType.Plans, BillingViewType.Invoices]}
                    onSelect={(p: BillingViewType) => setBillingView(p)}
                    selectedLabel={billingView}
                />
                {/* Temporary button for testing server code */}
                <div>
                    <button
                        type="submit"
                        className={classNames(
                            commonStyles.submitButton,
                        )}
                        onClick={onSubmit}
                    >
                        Continue to billing page
                    </button>
                </div>
            </div>
        </div>
    );
};