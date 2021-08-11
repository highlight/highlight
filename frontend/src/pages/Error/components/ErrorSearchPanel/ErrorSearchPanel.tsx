import React from 'react';

import { ErrorFeedV2 } from '../../../Errors/ErrorFeedV2/ErrorFeedV2';
import ErrorSearch from '../ErrorSearch/ErrorSearch';
import styles from './ErrorSearchPanel.module.scss';

const ErrorSearchPanel = () => {
    return (
        <aside className={styles.errorSearchPanel}>
            <div className={styles.filtersContainer}>
                <ErrorSearch />
            </div>
            <ErrorFeedV2 />
        </aside>
    );
};

export default ErrorSearchPanel;
