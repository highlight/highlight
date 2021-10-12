import React from 'react';

import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

type Props = {
    projectName: string;
};

export const MiniWorkspaceIcon = ({ projectName }: Props) => {
    return (
        <div>
            <div
                className={styles.workspaceIcon}
                style={{
                    backgroundColor: generateRandomColor(projectName ?? ''),
                }}
            >
                {projectName[0]?.toUpperCase() ?? 'H'}
            </div>
        </div>
    );
};
