import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

import styles from './Card.module.scss';

interface Props {
    title?: string;
    animation?: React.ReactNode;
}

const Card = ({ title, children, animation }: PropsWithChildren<Props>) => {
    return (
        <div
            className={classNames(styles.card, {
                [styles.center]: !!animation,
            })}
        >
            {animation && <div className={styles.animation}>{animation}</div>}
            {title && <h2>{title}</h2>}
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default Card;
