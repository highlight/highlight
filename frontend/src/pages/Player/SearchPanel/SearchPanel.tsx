import React from 'react';

import useHighlightAdminFlag from '../../../hooks/useHighlightAdminFlag/useHighlightAdminFlag';
import SessionSearch from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';
import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';
import SessionSearchFilters from './SessionSearchFilters/SessionSearchFilters';

const SearchPanel = () => {
    const { isHighlightAdmin } = useHighlightAdminFlag();

    return (
        <div className={styles.searchPanel}>
            <div className={styles.filtersContainer}>
                <SessionSearch />
                {isHighlightAdmin && <SegmentPickerForPlayer />}
                <SessionSearchFilters />
            </div>
            <SessionFeed />
        </div>
    );
};

export default SearchPanel;
