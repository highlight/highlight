import React, { useState } from 'react';

import styles from './SessionsPage.module.scss';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

// @ts-ignore
import useDimensions from "react-use-dimensions";
import { UserPropertyInput } from './SearchInputs/UserPropertyInputs';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [feedRef, { top, right }] = useDimensions();
    const [searchParams, setSearchParams] = useState<SearchParams>({ user_properties: [], identified: false });
    const [isSegment, setIsSegment] = useState<boolean>(false);
    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams, isSegment, setIsSegment }}>
            <div className={styles.sessionsBody}>
                <div className={styles.fixedPlaceholder} />
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

