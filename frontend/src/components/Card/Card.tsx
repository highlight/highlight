import classNames from 'classnames';
import React from 'react';

import styles from './Card.module.scss';

type Props = React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
};

const Card: React.FC<Props> = ({ children, noPadding = false, ...props }) => {
    return (
        <article
            {...props}
            className={classNames(styles.card, props.className, {
                [styles.noPadding]: noPadding,
            })}
        >
            {children}
        </article>
    );
};

export default Card;
