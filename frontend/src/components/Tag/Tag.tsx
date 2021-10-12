import React from 'react';

import styles from './Tag.module.scss';

interface Props {
    backgroundColor: string;
}

const Tag: React.FC<Props> = ({ children, backgroundColor }) => {
    return (
        <div
            style={{
                backgroundColor,
            }}
            className={styles.tag}
        >
            {children}
        </div>
    );
};

export default Tag;
