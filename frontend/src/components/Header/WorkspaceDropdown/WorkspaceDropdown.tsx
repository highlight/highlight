import { useGetProjectQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import React from 'react';

import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

export const MiniWorkspaceIcon = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const { data: currentProject } = useGetProjectQuery({
        variables: { id: project_id },
    });
    return (
        <div>
            <div
                className={styles.workspaceIcon}
                style={{
                    backgroundColor: generateRandomColor(
                        currentProject?.project?.name ?? ''
                    ),
                }}
            >
                {currentProject?.project?.name[0]?.toUpperCase() ?? 'H'}
            </div>
        </div>
    );
};
