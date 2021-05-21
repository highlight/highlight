import React from 'react';
import { Link } from 'react-router-dom';

import styles from './KeyPerformanceIndicator.module.scss';

interface Props {
    value: string;
    title: string;
    route?: string;
}

const KeyPerformanceIndicator = ({ title, value, route }: Props) => {
    const body = (
        <>
            <h2 className={styles.value}>{value}</h2>
            <p className={styles.label}>{title}</p>
        </>
    );
    return (
        <div className={styles.keyPerformanceIndicator}>
            {route ? <Link to={route}>{body}</Link> : body}
        </div>
    );
};

export default KeyPerformanceIndicator;
