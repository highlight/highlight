import { useParams } from '@util/react-router/useParams';
import React from 'react';

import { useGetOrganizationQuery } from '../../../graph/generated/hooks';
import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

export const MiniWorkspaceIcon = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data: currentOrg } = useGetOrganizationQuery({
        variables: { id: project_id },
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
