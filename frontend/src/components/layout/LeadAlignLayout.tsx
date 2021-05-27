import classNames from 'classnames';
import React from 'react';

import styles from './LeadAlignLayout.module.scss';

interface Props {
    fullWidth?: boolean;
}

const LeadAlignLayout: React.FC<Props> = ({ fullWidth = false, children }) => {
    return (
        <main
            className={classNames(styles.leadAlignLayout, {
                [styles.fullWidth]: fullWidth,
            })}
        >
            {children}
        </main>
    );
};

export default LeadAlignLayout;
