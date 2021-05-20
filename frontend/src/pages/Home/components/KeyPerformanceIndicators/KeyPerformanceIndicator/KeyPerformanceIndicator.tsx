import React from 'react';

import styles from './KeyPerformanceIndicator.module.scss';

interface Props {
    value: string;
    title: string;
}

const KeyPerformanceIndicator = ({ title, value }: Props) => {
    return (
        <div className={styles.keyPerformanceIndicator}>
            <h2 className={styles.value}>{value}</h2>
            <p className={styles.label}>{title}</p>
        </div>
    );
};

export default KeyPerformanceIndicator;
