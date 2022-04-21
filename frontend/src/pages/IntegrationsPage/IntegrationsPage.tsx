import { useAuthContext } from '@authentication/AuthContext';
import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { Skeleton } from '@components/Skeleton/Skeleton';
import Integration from '@pages/IntegrationsPage/components/Integration';
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils';
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    const { isSlackConnectedToWorkspace, loading } = useSlackBot({
        type: 'Organization',
    });

    const { isHighlightAdmin } = useAuthContext();

    const { isLinearIntegratedWithProject } = useLinearIntegration();

    const { isZapierIntegratedWithProject } = useZapierIntegration();

    const integrations = useMemo(() => {
        return INTEGRATIONS.filter((inter) =>
            inter.onlyShowForHighlightAdmin ? isHighlightAdmin : true
        ).map((inter) => ({
            ...inter,
            defaultEnable:
                (inter.key === 'slack' && isSlackConnectedToWorkspace) ||
                (inter.key === 'linear' && isLinearIntegratedWithProject) ||
                (inter.key === 'zapier' && isZapierIntegratedWithProject),
        }));
    }, [
        isSlackConnectedToWorkspace,
        isLinearIntegratedWithProject,
        isZapierIntegratedWithProject,
        isHighlightAdmin,
    ]);

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
