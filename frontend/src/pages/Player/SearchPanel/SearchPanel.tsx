import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import QueryBuilder from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
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
    const { isQueryBuilder } = usePlayerUIContext();
    return (
        <div className={styles.searchPanel}>
            {visible && (
                <>
                    <div className={styles.filtersContainer}>
                        {isQueryBuilder ? (
                            <>
                                <SegmentPickerForPlayer />
                                <QueryBuilder />
                            </>
                        ) : (
                            <>
                                <SessionSearch />
                                <SegmentPickerForPlayer />
                                <SessionSearchFilters />
                            </>
                        )}
                    </div>
                    <SessionFeed />
                </>
            )}
        </div>
    );
});

export default SearchPanel;
