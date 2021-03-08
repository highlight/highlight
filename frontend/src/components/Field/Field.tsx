import React from 'react';

import styles from './Field.module.scss';

export const Field = ({
    k,
    v,
    color,
}: {
    k: string;
    v: string;
    color?: string;
}) => {
    const c = color || '#eee7ff';
    return (
        <div className={styles.wrapper} style={{ border: `1px solid ${c}` }}>
            <div className={styles.keyValueWrapper}>
                <div
                    className={styles.key}
                    style={{
                        borderRight: `1px solid ${c}`,
                    }}
                >
                    {k}
                </div>
                <div
                    className={styles.value}
                    style={{ backgroundColor: `${c}` }}
                >
                    {v}
                </div>
            </div>
        </div>
    );
};
