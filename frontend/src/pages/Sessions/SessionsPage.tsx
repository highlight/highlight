import React from 'react';

import styles from './SessionsPage.module.scss';
import { SegmentSidebar } from './SegmentSidebar/SegmentSidebar';
import { SearchSidebar } from './SearchSidebar/SearchSidebar';
import { SearchParams } from './SearchContext/SearchContext';
import { SessionFeed } from './SessionsFeed/SessionsFeed';

import { IntegrationCard } from './IntegrationCard/IntegrationCard';
import { FeedNavigation } from './SearchSidebar/FeedNavigation/FeedNavigation';
import { Complete } from '../../util/types';

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
    visited_url: undefined,
    first_time: false,
};

export const SessionsPage = ({ integrated }: { integrated: boolean }) => {
    if (!integrated) {
        return <IntegrationCard />;
    }

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
        </div>
    );
};
