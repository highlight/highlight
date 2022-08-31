import { useAuthContext } from '@authentication/AuthContext';
import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { Skeleton } from '@components/Skeleton/Skeleton';
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils';
import Integration from '@pages/IntegrationsPage/components/Integration';
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils';
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { StringParam, useQueryParam } from 'use-query-params';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot({
        type: 'Organization',
    });

    const [popUpModal] = useQueryParam('enable', StringParam);

    const { isHighlightAdmin } = useAuthContext();

    const { isLinearIntegratedWithProject, loading: loadingLinear } =
        useLinearIntegration();

    const { isZapierIntegratedWithProject, loading: loadingZapier } =
        useZapierIntegration();

    const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } =
        useClearbitIntegration();

    const loading = useMemo(
        () => loadingLinear || loadingSlack || loadingZapier || loadingClearbit,
        [loadingLinear, loadingSlack, loadingZapier, loadingClearbit]
    );

    const integrations = useMemo(() => {
        return INTEGRATIONS.filter((inter) =>
            inter.onlyShowForHighlightAdmin ? isHighlightAdmin : true
        ).map((inter) => ({
            ...inter,
            defaultEnable:
                (inter.key === 'slack' && isSlackConnectedToWorkspace) ||
                (inter.key === 'linear' && isLinearIntegratedWithProject) ||
                (inter.key === 'zapier' && isZapierIntegratedWithProject) ||
                (inter.key === 'clearbit' && isClearbitIntegratedWithWorkspace),
        }));
    }, [
        isSlackConnectedToWorkspace,
        isLinearIntegratedWithProject,
        isZapierIntegratedWithProject,
        isClearbitIntegratedWithWorkspace,
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
                                showModalDefault={
                                    popUpModal === integration.key
                                }
                            />
                        )
                    )}
                </div>
            </LeadAlignLayout>
        </>
    );
};

export default IntegrationsPage;
