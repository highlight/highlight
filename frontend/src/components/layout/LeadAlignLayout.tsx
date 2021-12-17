import classNames from 'classnames';
import React from 'react';

import styles from './LeadAlignLayout.module.scss';

interface Props {
    fullWidth?: boolean;
    maxWidth?: number;
}

const LeadAlignLayout: React.FC<Props> = ({
    fullWidth = false,
    maxWidth,
    children,
}) => {
    return (
        <main
            className={classNames(styles.leadAlignLayout, {
                [styles.fullWidth]: fullWidth,
            })}
            style={{ maxWidth: maxWidth }}
        >
            {children}
        </main>
    );
};

export default LeadAlignLayout;
