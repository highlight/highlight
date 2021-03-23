import React, { useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@rehooks/local-storage';

import styles from './SessionsPage.module.scss';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchContext, SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { SidebarContext } from '../../components/Sidebar/SidebarContext';
import { FeedNavigation } from './SearchSidebar/FeedNavigation/FeedNavigation';
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';

/**
 * The initial search parameters. This is used when the user has not specified any search parameters.
 */
export const EmptySearchParams: SearchParams = {
    user_properties: [],
    identified: false,
};

export const SessionsPage = ({ integrated }: { integrated: boolean }) => {
    const { organization_id, segment_id } = useParams<{
        organization_id: string;
        segment_id: string;
    }>();
    const [segmentName, setSegmentName] = useState<string | null>(null);
    const [cachedParams, setCachedParams] = useLocalStorage<SearchParams>(
        `cachedParams-${segmentName || 'no-selected-segment'}`,
        EmptySearchParams
    );
    const [searchParams, setSearchParams] = useState<SearchParams>(
        cachedParams || { user_properties: [], identified: false }
    );
    const [existingParams, setExistingParams] = useState<SearchParams>(
        EmptySearchParams
    );
    const { setOpenSidebar } = useContext(SidebarContext);
    const history = useHistory();

    useEffect(() => setOpenSidebar(false), [setOpenSidebar]);

    useEffect(() => {
        setCachedParams(searchParams);
        // Initialize the route's state with the search parameters.
        if (segment_id) {
            history.replace(
                `/${organization_id}/sessions/segment/${segment_id}`,
                searchParams
            );
        }
    }, [history, organization_id, searchParams, segment_id, setCachedParams]);

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
                    <FeedNavigation />
                    <SegmentSidebar />
                </div>
                <div className={styles.centerPanel}>
                    <div className={styles.sessionsSection}>
                        <SessionFeed />
                    </div>
                </div>
                <div className={styles.rightPanel}>
                    <SearchSidebar />
                </div>
            </div>
        </SearchContext.Provider>
    );
};
