import { getPercentageDisplayValue } from '@components/BarChartTable/utils/utils';
import React from 'react';

import styles from './BarChartTableColumns.module.scss';

interface BarChartTablePercentageProps {
    percent: number;
}

export const BarChartTablePercentage = ({
    percent,
}: BarChartTablePercentageProps) => {
    return (
        <div className={styles.percentContainer}>
            <div
                className={styles.barGraph}
                style={
                    {
                        '--percentage': `${percent}%`,
                    } as React.CSSProperties
                }
            ></div>
            <span>{getPercentageDisplayValue(percent / 100)}</span>
        </div>
    );
};

interface BarChartTablePillProps {
    icon?: React.ReactNode;
    displayValue: string;
}

export const BarChartTablePill = ({
    displayValue,
    icon,
}: BarChartTablePillProps) => {
    return (
        <div className={styles.pill}>
            {icon && icon}
            {displayValue}
        </div>
    );
};
