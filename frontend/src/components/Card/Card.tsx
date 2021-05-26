import classNames from 'classnames';
import React from 'react';

import styles from './Card.module.scss';

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    ...props
}) => {
    return (
        <article
            {...props}
            className={classNames(styles.card, props.className)}
        >
            {children}
        </article>
    );
};

export default Card;
