import React from 'react';

import SessionSearch from '../../Sessions/SessionsFeedV2/components/SessionSearch/SessionSearch';
import { SessionFeed } from '../../Sessions/SessionsFeedV2/SessionsFeed';
import styles from './SearchPanel.module.scss';
import SegmentPickerForPlayer from './SegmentPickerForPlayer/SegmentPickerForPlayer';
import SessionSearchFilters from './SessionSearchFilters/SessionSearchFilters';

interface Props {
    visible: boolean;
}

const SearchPanel = React.memo(({ visible }: Props) => {
    return (
        <div className={styles.searchPanel}>
            {visible && (
                <>
                    <div className={styles.filtersContainer}>
                        <SessionSearch />
                        <SegmentPickerForPlayer />
                        <SessionSearchFilters />
                    </div>
                    <SessionFeed />
                </>
            )}
        </div>
    );
});

export default SearchPanel;
