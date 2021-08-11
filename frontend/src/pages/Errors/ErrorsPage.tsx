import React from 'react';

import { Complete } from '../../util/types';
import { IntegrationCard } from '../Sessions/IntegrationCard/IntegrationCard';
import { FeedNavigation } from '../Sessions/SearchSidebar/FeedNavigation/FeedNavigation';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';
import { ErrorSearchParams } from './ErrorSearchContext/ErrorSearchContext';
import { ErrorSearchSidebar } from './ErrorSearchSidebar/ErrorSearchSidebar';
import { ErrorSegmentSidebar } from './ErrorSegmentSidebar/ErrorSegmentSidebar';
import styles from './ErrorsPage.module.scss';

export const EmptyErrorsSearchParams: Complete<ErrorSearchParams> = {
    browser: undefined,
    date_range: undefined,
    event: undefined,
    hide_resolved: false,
    os: undefined,
    visited_url: undefined,
};

const ErrorsPage = ({ integrated }: { integrated: boolean }) => {
    return (
        <div className={styles.errorsBody}>
            <div className={styles.leftPanel}>
                <FeedNavigation />
                <ErrorSegmentSidebar />
            </div>
            <div className={styles.centerPanel}>
                <div className={styles.errorsSection}>
                    <ErrorFeed />
                </div>
            </div>
            <div className={styles.rightPanel}>
                <ErrorSearchSidebar />
            </div>
            {!integrated && <IntegrationCard />}
        </div>
    );
};

export default ErrorsPage;
