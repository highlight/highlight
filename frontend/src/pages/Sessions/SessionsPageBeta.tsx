import React, { useState } from 'react';

import styles from './SessionsPage.module.scss';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';
import { UserPropertyInput } from './SearchInputs/UserPropertyInputs';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [searchParams, setSearchParams] = useState<SearchParams>({ user_properties: [], identified: false });
    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams }}>
            <div className={styles.sessionsBody}>
                <div className={styles.sessionsSection}>
                    <UserPropertyInput />
                    <SessionFeed />
                </div>
                <SearchSidebar />
            </div>
        </SearchContext.Provider >
    );
};

