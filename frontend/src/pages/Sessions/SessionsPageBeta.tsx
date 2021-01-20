import React, { useContext, useEffect, useState } from 'react';

import styles from './SessionsPage.module.scss';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

// @ts-ignore
import useDimensions from "react-use-dimensions";
import { UserPropertyInput } from './SearchInputs/UserPropertyInputs';
import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [feedRef, { top, right, x }] = useDimensions();
    const [searchParams, setSearchParams] = useState<SearchParams>({ user_properties: [], identified: false });
    const [existingParams, setExistingParams] = useState<SearchParams>({ user_properties: [], identified: false });
    const [isSegment, setIsSegment] = useState<boolean>(false);
    const { setOpenSidebar } = useContext(SidebarContext);
    
    useEffect(() => setOpenSidebar(false), [setOpenSidebar])

    if (!integrated) {
        return <IntegrationCard />
    }

    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams, existingParams, setExistingParams, isSegment, setIsSegment }}>
            <div className={styles.sessionsBody}>
                <div className={styles.fixedPlaceholder} />
                <SegmentSidebar feedPosition={{ top, x }} />
                <div className={styles.mainUserInput}>
                    <div className={styles.userInputWrapper}>
                        <UserPropertyInput include/>
                    </div>
                </div>
                <div className={styles.sessionsSection}
                    ref={feedRef}
                >
                    <SessionFeed />
                </div>
                <SearchSidebar feedPosition={{ top, right }} />
            </div>
        </SearchContext.Provider >
    );
};

