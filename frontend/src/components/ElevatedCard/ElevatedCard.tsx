import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import styles from './ElevatedCard.module.scss';

interface Props {
    title?: string | React.ReactNode;
    animation?: React.ReactNode;
    /** Buttons or action elements for the card. These are rendered at the bottom of the card. */
    actions?: React.ReactNode;
    className?: string;
    childrenClassName?: string;
}

const ElevatedCard = ({
    title,
    children,
    animation,
    actions,
    className,
    childrenClassName,
}: PropsWithChildren<Props>) => {
    return (
        <div
            className={classNames(
                styles.card,
                {
                    [styles.center]: !!animation,
                },
                className
            )}
        >
            {animation && <div className={styles.animation}>{animation}</div>}
            {title && <h2>{title}</h2>}
            <div className={classNames(styles.content, childrenClassName)}>
                {children}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
};

export default ElevatedCard;
