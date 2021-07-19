import React from 'react';

import styles from './Landing.module.scss';

export const Landing: React.FC<{}> = ({ children }) => {
    return <div className={styles.contentWrapper}>{children}</div>;
};
