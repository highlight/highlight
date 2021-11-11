import React from 'react';

import ElevatedCard from '../ElevatedCard/ElevatedCard';
import styles from './FullBleedCard.module.scss';

interface Props {
    title: string | React.ReactNode;
    /** A Lottie component with the animation. */
    animation?: React.ReactNode;
    className?: string;
    childrenClassName?: string;
}

const FullBleedCard: React.FC<Props> = ({
    animation,
    title,
    className,
    childrenClassName,
    children,
}) => {
    return (
        <div className={styles.fullBleedCard}>
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
