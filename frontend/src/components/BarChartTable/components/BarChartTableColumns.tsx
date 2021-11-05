import { Avatar } from '@components/Avatar/Avatar';
import { getPercentageDisplayValue } from '@components/BarChartTable/utils/utils';
import { Session } from '@graph/schemas';
import { getIdentifiedUserProfileImage } from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils';
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

export const BarChartTableRowGroup: React.FC = ({ children }) => {
    return <div className={styles.rowGroup}>{children}</div>;
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

interface BarChartTableUserAvatarProps {
    userProperties: string;
    identifier: string;
}

export const BarChartTableUserAvatar = ({
    identifier,
    userProperties,
}: BarChartTableUserAvatarProps) => {
    return (
        <Avatar
            seed={identifier}
            style={{
                height: 'var(--size-large)',
                width: 'var(--size-large)',
                borderRadius: 'var(--size-xSmall)',
                border: '1px solid var(--text-primary-inverted)',
            }}
            customImage={getIdentifiedUserProfileImage({
                user_properties: userProperties,
            } as Session)}
        />
    );
};
