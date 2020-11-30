import React, { useEffect, useRef, useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import classNames from 'classnames/bind';

import commonStyles from '../../Common.module.css';
import styles from './Billing.module.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

type Inputs = {
    email: string;
};

enum BillingViewType {
    Plans = "Plans", Invoices = "Invoices"
}

export const Billing = () => {
    const { organization_id } = useParams();
    // const emailRef = useRef<null | HTMLInputElement>(null);
    // const { register, handleSubmit, errors, reset } = useForm<Inputs>();

    const [billingView, setBillingView] = useState((BillingViewType.Plans))

    const { data: orgData } = useQuery<
        { organization: { name: string } },
        { id: number }
    >(
        gql`
            query GetOrganization($id: ID!) {
                organization(id: $id) {
                    name
                }
            }
        `,
        { variables: { id: organization_id } }
    );
    const { data, error } = useQuery<
        { admins: { id: number; name: string; email: string }[] },
        { organization_id: number }
    >(
        gql`
            query GetAdmins($organization_id: ID!) {
                admins(organization_id: $organization_id) {
                    id
                    name
                    email
                }
            }
        `,
        { variables: { organization_id } }
    );

    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => {
        setOpenSidebar(true);
    }, []);

    if (error) {
        return <div>{JSON.stringify(error)}</div>;
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
                    >
                        Continue to billing page
                    </button>
                </div>
            </div>
        </div>
    );
};
