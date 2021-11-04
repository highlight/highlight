import classNames from 'classnames';
import React from 'react';

import styles from './Card.module.scss';

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
    noPadding?: boolean;
    title?: string | React.ReactNode;
    interactable?: boolean;
};

const Card: React.FC<Props> = ({
    title,
    children,
    noPadding = false,
    interactable = false,
    ...props
}) => {
    return (
        <article
            {...props}
            className={classNames(styles.card, props.className, {
                [styles.noPadding]: noPadding,
                [styles.interactable]: interactable,
            })}
        >
            {title && (
                <div className={styles.titleContainer}>
                    {typeof title === 'string' ? (
                        <h3 className={styles.h3}>{title}</h3>
                    ) : (
                        title
                    )}
                </div>
            )}
            {children}
        </article>
    );
};

export default Card;
