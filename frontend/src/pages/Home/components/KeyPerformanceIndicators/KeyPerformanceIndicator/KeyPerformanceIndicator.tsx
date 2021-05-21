import React from 'react';
import { Link } from 'react-router-dom';

import Tooltip from '../../../../../components/Tooltip/Tooltip';
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
            <p className={styles.label}>{title}</p>
        </>
    );
    return (
        <Tooltip
            title={tooltipText}
            placement="topLeft"
            align={{ offset: [-8, 0] }}
        >
            <div className={styles.keyPerformanceIndicator}>
                {route ? <Link to={route}>{body}</Link> : body}
            </div>
        </Tooltip>
    );
};

export default KeyPerformanceIndicator;
