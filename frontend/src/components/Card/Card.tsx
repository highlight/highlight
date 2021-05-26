import React from 'react';

import styles from './Card.module.scss';

const Card: React.FC = ({ children }) => {
    return <article className={styles.card}>{children}</article>;
};

export default Card;
