import classNames from 'classnames';
import React from 'react';

import { generateRandomColor } from '../../../util/color';
import styles from './WorkspaceDropdown.module.scss';

type Props = {
    projectName: string;
    className?: string;
};

export const MiniWorkspaceIcon = ({ projectName, className }: Props) => {
    return (
        <div>
            <div
                className={classNames(styles.workspaceIcon, className)}
                style={{
                    backgroundColor: generateRandomColor(projectName ?? ''),
                }}
            >
                {projectName[0]?.toUpperCase() ?? 'H'}
            </div>
        </div>
    );
};
