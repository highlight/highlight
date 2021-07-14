import React from 'react';

import styles from './DataCard.module.scss';

interface Props {
    title: string | React.ReactNode;
}

const DataCard: React.FC<Props> = ({ children, title }) => {
    return (
        <article className={styles.card}>
            <h2>{title}</h2>
            {children}
        </article>
    );
};

export default DataCard;
