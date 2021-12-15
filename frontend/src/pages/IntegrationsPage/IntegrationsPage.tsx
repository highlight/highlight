import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import Integration from '@pages/IntegrationsPage/components/Integration';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import React from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    return (
        <>
            <Helmet>
                <title>Integrations</title>
            </Helmet>
            <LeadAlignLayout>
                <h2>Integrations</h2>
                <p className={layoutStyles.subTitle}>
                    Supercharge your workflows and connect Highlight with the
                    tools you use everyday.
                </p>

                <div className={styles.integrationsContainer}>
                    {INTEGRATIONS.map((integration) => (
                        <Integration
                            integration={integration}
                            key={integration.key}
                        />
                    ))}
                </div>
            </LeadAlignLayout>
        </>
    );
};

export default IntegrationsPage;
