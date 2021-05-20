import React from 'react';

import styles from './EmptyCardPlaceholder.module.scss';

interface Props {
    message?: string | React.ReactNode;
}

const EmptyCardPlaceholder = ({ message }: Props) => {
    return (
        <div className={styles.emptyCardPlaceholder}>
            <h3>No data yet</h3>
            <p>
                {message ||
                    'Your data will show up here as Highlight records sessions.'}
            </p>
        </div>
    );
};

export default EmptyCardPlaceholder;
