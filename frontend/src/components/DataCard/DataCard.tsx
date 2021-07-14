import classNames from 'classnames';
import React from 'react';

import styles from './DataCard.module.scss';

interface Props {
    title: string | React.ReactNode;
    /** Should the card span the full available width. */
    fullWidth?: boolean;
}

const DataCard: React.FC<Props> = ({ children, title, fullWidth = false }) => {
    return (
        <article
            className={classNames(styles.card, {
                [styles.fullWidth]: fullWidth,
            })}
        >
            <h2>{title}</h2>
            <main className={styles.content}>{children}</main>
        </article>
    );
};

export default DataCard;
