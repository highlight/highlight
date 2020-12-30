import React, { useState, useContext } from 'react';

import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

import styles from './SessionsPage.module.scss';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { OptionsType, OptionTypeBase } from 'react-select';
import { SearchContext, SearchParams, UserProperty } from './SearchContext/SearchContext';
import { UserPropertyInput } from './UserPropertyInput/UserPropertyInput';
import { ReactComponent as ExpandIcon } from '../../static/expand.svg';

export const SessionsPageBeta = ({ integrated }: { integrated: boolean }) => {
    const [searchParams, setSearchParams] = useState<SearchParams>({ userProperties: [] });
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
                </div>
                <SearchSidebar open={openSidebar} />
            </div>
        </SearchContext.Provider >
    );
};

