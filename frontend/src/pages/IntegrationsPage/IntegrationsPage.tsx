import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Integration from '@pages/IntegrationsPage/components/Integration';
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    const { isSlackConnectedToWorkspace, loading } = useSlackBot({
        type: 'Organization',
    });

    const { isLinearIntegratedWithProject } = useLinearIntegration();

    const integrations = useMemo(() => {
        return INTEGRATIONS.map((inter) => ({
            ...inter,
            defaultEnable:
                (inter.key === 'slack' && isSlackConnectedToWorkspace) ||
                (inter.key === 'linear' && isLinearIntegratedWithProject),
        }));
    }, [isSlackConnectedToWorkspace, isLinearIntegratedWithProject]);

    return (
        <>
            <Helmet>
                <title>Integrations</title>
            </Helmet>
            <LeadAlignLayout>
                <h2>Integrations</h2>
                <p className={layoutStyles.subTitle}>
                    Supercharge your workflows and attach Highlight with the
                    tools you use everyday.
                </p>
                <div className={styles.integrationsContainer}>
                    {integrations.map((integration) =>
                        loading ? (
                            <Skeleton height={187} />
                        ) : (
                            <Integration
                                integration={integration}
                                key={integration.key}
                            />
                        )
                    )}
                </div>
            </LeadAlignLayout>
        </>
    );
};

export default IntegrationsPage;
