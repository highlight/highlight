import React from 'react';

import styles from './Field.module.scss';

export const Field = ({ k, v }: { k: string; v: string }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.keyValueWrapper}>
                <div className={styles.key}>{k}</div>
                <div className={styles.value}>{v}</div>
            </div>
        </div>
    );
};
