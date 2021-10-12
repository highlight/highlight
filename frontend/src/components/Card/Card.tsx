import classNames from 'classnames';
import React from 'react';

import styles from './Card.module.scss';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
    title?: string;
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
                    <h3>{title}</h3>
                </div>
            )}
            {children}
        </article>
    );
};

export default Card;
