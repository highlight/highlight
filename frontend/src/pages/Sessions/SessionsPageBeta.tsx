import React, { useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@rehooks/local-storage';

import styles from './SessionsPage.module.scss';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

// @ts-ignore
import useDimensions from 'react-use-dimensions';
import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [feedRef, { top, right, x }] = useDimensions();
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [cachedParams, setCachedParams] = useLocalStorage<SearchParams>(
        `cachedParams-${segmentName || 'no-selected-segment'}`,
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
            <div className={styles.sessionsBody}>
                <div className={styles.leftPanel}>
                    <SegmentSidebar feedPosition={{ top, x }} />
                </div>
                <div className={styles.centerPanel}>
                    <div className={styles.sessionsSection} ref={feedRef}>
                        <SessionFeed />
                    </div>
                </div>
                <div className={styles.rightPanel}>
                    <SearchSidebar feedPosition={{ top, right }} />
                </div>
            </div>
        </SearchContext.Provider>
    );
};
