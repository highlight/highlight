import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils';
import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import { LoadingBar } from '@components/Loading/Loading';
import Integration from '@pages/IntegrationsPage/components/Integration';
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations';
import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss';
import styles from './IntegrationsPage.module.scss';

const IntegrationsPage = () => {
    const { isSlackConnectedToWorkspace, loading } = useSlackBot({
        type: 'Organization',
        watch: true,
    });

    const integrations = useMemo(() => {
        return INTEGRATIONS.map((inter) => ({
            ...inter,
            defaultEnable: inter.key === 'slack' && isSlackConnectedToWorkspace,
        }));
    }, [isSlackConnectedToWorkspace]);

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
                {loading ? (
                    <LoadingBar />
                ) : (
                    <div className={styles.integrationsContainer}>
                        {integrations.map((integration) => (
                            <Integration
                                integration={integration}
                                key={integration.key}
                            />
                        ))}
                    </div>
                )}
            </LeadAlignLayout>
        </>
    );
};

export default IntegrationsPage;
