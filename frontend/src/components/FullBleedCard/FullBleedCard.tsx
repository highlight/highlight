import React from 'react';

import ElevatedCard from '../ElevatedCard/ElevatedCard';
import styles from './FullBleedCard.module.scss';

interface Props {
    title?: string;
    /** A Lottie component with the animation. */
    animation?: React.ReactNode;
    className?: string;
    closeIcon?: React.ReactNode;
    childrenClassName?: string;
}

const FullBleedCard: React.FC<Props> = ({
    animation,
    title,
    closeIcon,
    className,
    childrenClassName,
    children,
}) => {
    return (
        <div className={styles.fullBleedCard}>
            <div>{closeIcon}</div>
            <ElevatedCard
                title={title}
                animation={animation}
                className={className}
                childrenClassName={childrenClassName}
            >
                {children}
            </ElevatedCard>
        </div>
    );
};

export default FullBleedCard;
