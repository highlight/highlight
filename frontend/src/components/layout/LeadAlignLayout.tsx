import classNames from 'classnames';
import React from 'react';

import styles from './LeadAlignLayout.module.scss';

interface Props {
    fullWidth?: boolean;
    maxWidth?: number;
}

const LeadAlignLayout: React.FC<Props & { className?: string }> = ({
    fullWidth = false,
    maxWidth,
    children,
    className,
}) => {
    return (
        <main
            className={classNames(className, styles.leadAlignLayout, {
                [styles.fullWidth]: fullWidth,
            })}
            style={{ maxWidth: maxWidth }}
        >
            {children}
        </main>
    );
};

export default LeadAlignLayout;
