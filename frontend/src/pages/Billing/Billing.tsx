import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
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

// TODO DENISE: what is the good way to handle this in typescript
const stripe_publishable_key: string = process.env.STRIPE_API_PK ? process.env.STRIPE_API_PK : ""
const stripePromise = loadStripe(stripe_publishable_key);

export const Billing = () => {
    const { organization_id } = useParams();

    const [billingView, setBillingView] = useState((BillingViewType.Plans))

    const { setOpenSidebar } = useContext(SidebarContext);

    const [createCheckout, { loading, data, error }] = useMutation<
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
    }, []);

    const onSubmit = async () => {
        createCheckout({ variables: { organization_id: organization_id, price_id: "price_1HswN7Gz4ry65q421RTixaZB" } })
    }

    console.log(data)
    if (data?.createCheckout) {

        (async function () {
            const stripe = await stripePromise;
            const result = stripe ? await stripe.redirectToCheckout({
                sessionId: data.createCheckout,
            }) : { error: "stripe missin" }; // TODO DENISE: i just added this for typescript, will clean up before merging

            if (result.error) {
                console.log('redirect to checkout failed')
                // TODO DENISE: handle this case
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer
                // using `result.error.message`.
            }
        })()
    }


    return (
        <div className={styles.billingPageWrapper}>
            <div className={styles.blankSidebar}></div>
            <div className={styles.billingPage}>
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
