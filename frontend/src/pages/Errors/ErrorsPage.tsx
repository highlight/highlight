import React, { useContext, useEffect, useState } from 'react';
import styles from './ErrorsPage.module.scss';
import { ErrorFeed } from './ErrorFeed/ErrorFeed';
import {
    SearchContext,
    SearchParams,
} from '../Sessions/SearchContext/SearchContext';
import { ErrorSearchSidebar } from './ErrorSearchSidebar/ErrorSearchSidebar';
import { ErrorSegmentSidebar } from './ErrorSegmentSidebar/ErrorSegmentSidebar';
import { useLocalStorage } from '@rehooks/local-storage';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { FeedNavigation } from '../Sessions/SearchSidebar/FeedNavigation/FeedNavigation';
import { IntegrationCard } from '../Sessions/IntegrationCard/IntegrationCard';

export const ErrorsPage = ({ integrated }: { integrated: boolean }) => {
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [cachedParams, setCachedParams] = useLocalStorage<SearchParams>(
        `cachedErrorParams-${segmentName || 'no-selected-segment'}`,
        { user_properties: [], identified: false }
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        cachedParams || { user_properties: [], identified: false }
    );
    const [existingParams, setExistingParams] = useState<SearchParams>({
        user_properties: [],
        identified: false,
    });
    const { setOpenSidebar } = useContext(SidebarContext);

    useEffect(() => setOpenSidebar(false), [setOpenSidebar]);

    useEffect(() => setCachedParams(searchParams), [
        searchParams,
        setCachedParams,
    ]);

    if (!integrated) {
        return <IntegrationCard />;
    }

    return (
        <SearchContext.Provider
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
        </SearchContext.Provider>
    );
};
