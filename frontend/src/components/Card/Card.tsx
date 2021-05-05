import React, { PropsWithChildren } from 'react';
import styles from './Card.module.scss';

interface Props {
    title: string;
}

const Card = ({ title, children }: PropsWithChildren<Props>) => {
    return (
        <div className={styles.card}>
            <h2>{title}</h2>
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default Card;
