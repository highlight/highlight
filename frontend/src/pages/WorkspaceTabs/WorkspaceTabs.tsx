import LeadAlignLayout from '@components/layout/LeadAlignLayout';
import Tabs from '@components/Tabs/Tabs';
import WorkspaceSettings from '@pages/WorkspaceSettings/WorkspaceSettings';
import WorkspaceTeam from '@pages/WorkspaceTeam/WorkspaceTeam';
import { useParams } from '@util/react-router/useParams';
import React, { Suspense } from 'react';
import { useHistory } from 'react-router-dom';

import styles from './WorkspaceTabs.module.scss';

const BillingPage = React.lazy(() => import('../Billing/Billing'));

type WorkspacePage = 'team' | 'settings' | 'billing';

export const WorkspaceTabs = () => {
    const history = useHistory();

    const { workspace_id, page_id } = useParams<{
        workspace_id: string;
        page_id: WorkspacePage;
    }>();

    console.log('page_id!', page_id);

    return (
        <LeadAlignLayout fullWidth>
            <Tabs
                className={styles.workspaceTabs}
                centered
                noPadding
                activeKeyOverride={page_id}
                onChange={(activeKey) =>
                    history.push(`/w/${workspace_id}/${activeKey}`)
                }
                tabs={[
                    {
                        key: 'team',
                        title: 'Team',
                        panelContent: <WorkspaceTeam />,
                    },
                    {
                        key: 'settings',
                        title: 'Settings',
                        panelContent: <WorkspaceSettings />,
                    },
                    {
                        key: 'billing',
                        title: 'Billing',
                        panelContent: (
                            <Suspense fallback={null}>
                                <BillingPage />
                            </Suspense>
                        ),
                    },
                ]}
                id="WorkspaceSettings"
            />
        </LeadAlignLayout>
    );
};
