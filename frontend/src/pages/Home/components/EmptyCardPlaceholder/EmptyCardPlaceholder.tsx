import React from 'react';

import styles from './EmptyCardPlaceholder.module.scss';

const EmptyCardPlaceholder = () => {
    return (
        <div className={styles.emptyCardPlaceholder}>
            <h3>No data yet</h3>
            <p>Your data will show up here as Highlight records sessions.</p>
        </div>
    );
};

export default EmptyCardPlaceholder;
