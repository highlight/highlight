import React, { useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@rehooks/local-storage';

import styles from './SessionsPage.module.scss';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

// @ts-ignore
import useDimensions from 'react-use-dimensions';
import { UserPropertyInput } from './SearchInputs/UserPropertyInputs';
import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [feedRef, { top, right, x }] = useDimensions();
    const [cachedParams, setCachedParams] = useLocalStorage<SearchParams>(
        'cachedParams',
        { user_properties: [], identified: false }
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        cachedParams || { user_properties: [], identified: false }
    );
    const [existingParams, setExistingParams] = useState<SearchParams>({
        user_properties: [],
        identified: false,
    });
    const [isSegment, setIsSegment] = useState<boolean>(false);
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
                isSegment,
                setIsSegment,
            }}
        >
            <div className={styles.sessionsBody}>
                {/* <div className={styles.fixedPlaceholder} /> */}
                <div className={styles.leftPanel}>
                    <SegmentSidebar feedPosition={{ top, x }} />
                </div>
                <div className={styles.centerPanel}>
                    <div className={styles.mainUserInput}>
                        <div className={styles.userInputWrapper}>
                            <UserPropertyInput include />
                        </div>
                    </div>
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
