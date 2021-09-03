import React from 'react';
import { useParams } from '@util/react-router/useParams';

import { useGetOrganizationQuery } from '../../../graph/generated/hooks';
import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

export const MiniWorkspaceIcon = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data: currentOrg } = useGetOrganizationQuery({
        variables: { id: organization_id },
    });
    return (
        <div>
            <div
                className={styles.workspaceIcon}
                style={{
                    backgroundColor: generateRandomColor(
                        currentOrg?.organization?.name ?? ''
                    ),
                }}
            >
                {currentOrg?.organization?.name[0]?.toUpperCase() ?? 'H'}
            </div>
        </div>
    );
};
