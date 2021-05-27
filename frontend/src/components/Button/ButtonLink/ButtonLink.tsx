import React from 'react';
import { Link } from 'react-router-dom';

import styles from './ButtonLink.module.scss';

interface Props {
    to: string;
}

const ButtonLink: React.FC<Props> = ({ to, children }) => {
    return (
        <Link to={to} className={styles.link}>
            {children}
        </Link>
    );
};

export default ButtonLink;
