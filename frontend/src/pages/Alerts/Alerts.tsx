import React from 'react';
import { useParams } from 'react-router-dom';

import LeadAlignLayout from '../../components/layout/LeadAlignLayout';
import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import { useGetErrorAlertQuery } from '../../graph/generated/hooks';

const AlertsPage = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data } = useGetErrorAlertQuery({
        variables: { organization_id: organization_id },
    });
    console.log(data);
    return (
        <LeadAlignLayout>
            <h2>Configure your alerts</h2>
            <p className={layoutStyles.subTitle}>
                Configure the environments you want alerts for.
            </p>
        </LeadAlignLayout>
    );
};

export default AlertsPage;
