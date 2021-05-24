import React from 'react';

import styles from './LeadAlignLayout.module.scss';

const LeadAlignLayout: React.FC = ({ children }) => {
    return <main className={styles.leadAlignLayout}>{children}</main>;
};

export default LeadAlignLayout;
