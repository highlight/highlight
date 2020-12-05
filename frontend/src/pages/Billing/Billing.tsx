import React, { useEffect, useContext, useState } from 'react';
import { RadioGroup } from '../../components/RadioGroup/RadioGroup';
import classNames from 'classnames/bind';

import commonStyles from '../../Common.module.css';
import styles from './Billing.module.css';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

enum BillingViewType {
    Plans = "Plans", Invoices = "Invoices"
}

export const Billing = () => {
    const [billingView, setBillingView] = useState((BillingViewType.Plans))

    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => {
        setOpenSidebar(true);
    }, [setOpenSidebar]);

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
