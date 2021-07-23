import React from 'react';

import { Complete } from '../../util/types';
import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { SearchParams } from './SearchContext/SearchContext';
import { FeedNavigation } from './SearchSidebar/FeedNavigation/FeedNavigation';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SessionFeed } from './SessionsFeed/SessionsFeed';
import styles from './SessionsPage.module.scss';

/**
 * The initial search parameters. This is used when the user has not specified any search parameters.
 */
export const EmptySessionsSearchParams: Complete<SearchParams> = {
    user_properties: [],
    identified: false,
    browser: undefined,
    date_range: undefined,
    excluded_properties: [],
    hide_viewed: false,
    length_range: undefined,
    os: undefined,
    referrer: undefined,
    track_properties: [],
    excluded_track_properties: [],
    visited_url: undefined,
    first_time: false,
    device_id: undefined,
    show_live_sessions: false,
};

const SessionsPage = ({ integrated }: { integrated: boolean }) => {
    return (
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
            {!integrated && <IntegrationCard />}
        </div>
    );
};

export default SessionsPage;
