import React from 'react';
import { Link } from 'react-router-dom';

import InfoTooltip from '../../../../../components/InfoTooltip/InfoTooltip';
import styles from './KeyPerformanceIndicator.module.scss';

interface Props {
    value: string;
    title: string;
    route?: string;
    tooltipText: string | React.ReactNode;
}

const KeyPerformanceIndicator = ({
    title,
    value,
    route,
    tooltipText,
}: Props) => {
    const body = (
        <>
            <h2 className={styles.value}>{value}</h2>
            <span className={styles.labelContainer}>
                <p className={styles.label}>{title}</p>
                <InfoTooltip title={tooltipText} className={styles.tooltip} />
            </span>
        </>
    );
    return (
        <div className={styles.keyPerformanceIndicator}>
            {route ? <Link to={route}>{body}</Link> : body}
        </div>
    );
};

export default KeyPerformanceIndicator;
