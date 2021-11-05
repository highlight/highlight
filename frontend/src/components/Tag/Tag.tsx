import InfoTooltip from '@components/InfoTooltip/InfoTooltip';
import React from 'react';

import styles from './Tag.module.scss';

interface Props {
    backgroundColor?: string;
    color?: string;
    infoTooltipText?: string;
}

const Tag: React.FC<Props> = ({
    children,
    backgroundColor = 'var(--color-orange-300)',
    color = 'var(--text-primary)',
    infoTooltipText,
}) => {
    return (
        <div
            style={{
                backgroundColor,
                color,
            }}
            className={styles.tag}
        >
            {children}
            {infoTooltipText && <InfoTooltip title={infoTooltipText} />}
        </div>
    );
};

export default Tag;
