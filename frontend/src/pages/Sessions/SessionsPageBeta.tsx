import React, { useState } from 'react';

import styles from './SessionsPage.module.scss';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { UserPropertyInput } from './UserPropertyInput/UserPropertyInput';
import { ReactComponent as ExpandIcon } from '../../static/expand.svg';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [searchParams, setSearchParams] = useState<SearchParams>({ user_properties: [] });
    const [openSidebar, setOpenSidebar] = useState<boolean>(false);
    return (
        <SearchContext.Provider value={{ searchParams, setSearchParams }}>
            <div className={styles.sessionsBody}>
                <div className={styles.sessionsSection}>
                    <UserPropertyInput />
                    <div className={styles.advancedSearchButton} onClick={() => setOpenSidebar(!openSidebar)}>
                        <div className={styles.advancedText}>Advanced Search</div>
                        <div className={styles.advancedIcon}>
                            <ExpandIcon />
                        </div>
                    </div>
                    <SessionFeed />
                </div>
                <SearchSidebar open={openSidebar} />
            </div>
        </SearchContext.Provider >
    );
};

