import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import { useMutation, gql } from '@apollo/client';
import classNames from 'classnames/bind';

import commonStyles from '../../Common.module.css';
import styles from './Billing.module.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

enum BillingViewType {
    Plans = "Plans", Invoices = "Invoices"
}

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

    const onSubmit = () => {
        createCheckout({ variables: { organization_id: organization_id, price_id: "one dolla" } }) // .then(() => {
    }

    console.log(data)
    if (data?.createCheckout) {
        // TODO: might not be the best way to redirect here...
        window.location.replace(data.createCheckout)
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
