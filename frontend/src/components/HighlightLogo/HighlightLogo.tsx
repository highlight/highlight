import React from 'react';

import styles from './HighlightLogo.module.scss';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';

export const HighlightLogo = () => {
    return (
        <>
            <HighlightLogoSmall className={styles.logo} />
            <span className={styles.logoText}>Highlight</span>
        </>
    );
};
