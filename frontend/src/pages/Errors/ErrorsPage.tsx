import { useLocalStorage } from '@rehooks/local-storage';
import React, { useEffect, useState } from 'react';

import { Complete } from '../../util/types';
import { IntegrationCard } from '../Sessions/IntegrationCard/IntegrationCard';
import { FeedNavigation } from '../Sessions/SearchSidebar/FeedNavigation/FeedNavigation';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';
import {
    ErrorSearchContext,
    ErrorSearchParams,
} from './ErrorSearchContext/ErrorSearchContext';
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
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [cachedParams, setCachedParams] = useLocalStorage<ErrorSearchParams>(
        `cachedErrorParams-${segmentName || 'no-selected-segment'}`,
        {}
    );
    const [searchParams, setSearchParams] = useState<ErrorSearchParams>(
        cachedParams || EmptyErrorsSearchParams
    );
    const [existingParams, setExistingParams] = useState<ErrorSearchParams>({});

    useEffect(() => setCachedParams(searchParams), [
        searchParams,
        setCachedParams,
    ]);

    if (!integrated) {
        return <IntegrationCard />;
    }

    return (
        <ErrorSearchContext.Provider
            value={{
                searchParams,
                setSearchParams,
                existingParams,
                setExistingParams,
                segmentName,
                setSegmentName,
            }}
        >
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
            </div>
        </ErrorSearchContext.Provider>
    );
};

export default ErrorsPage;
